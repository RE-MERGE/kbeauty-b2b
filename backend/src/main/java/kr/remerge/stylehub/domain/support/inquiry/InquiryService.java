package kr.remerge.stylehub.domain.support.inquiry;

import kr.remerge.stylehub.domain.company.entity.Company;
import kr.remerge.stylehub.domain.company.repository.CompanyRepository; // 프로젝트 실제 경로에 맞춤
import kr.remerge.stylehub.domain.support.enumtype.FaqCategory;
import kr.remerge.stylehub.domain.support.inquiry.dto.request.CreateInquiryRequest;
import kr.remerge.stylehub.domain.support.inquiry.dto.request.InquiryMessageRequest;
import kr.remerge.stylehub.domain.support.inquiry.dto.response.InquiryMessageResponse;
import kr.remerge.stylehub.domain.support.inquiry.dto.response.InquiryResponse;
import kr.remerge.stylehub.domain.support.inquiry.entity.Inquiry;
import kr.remerge.stylehub.domain.support.inquiry.entity.InquiryMessage;
import kr.remerge.stylehub.domain.support.inquiry.entity.InquiryMessageRead;
import kr.remerge.stylehub.domain.support.inquiry.enumtype.InquiryStatus;
import kr.remerge.stylehub.domain.support.inquiry.repository.InquiryMessageReadRepository;
import kr.remerge.stylehub.domain.support.inquiry.repository.InquiryMessageRepository;
import kr.remerge.stylehub.domain.support.inquiry.repository.InquiryRepository;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.repository.UserRepository; // 프로젝트 실제 경로에 맞춤
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryMessageRepository inquiryMessageRepository;
    private final InquiryMessageReadRepository inquiryMessageReadRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    /**
     * 1. 1:1 문의 내역 리스트 조회
     * - ADMIN     → 전체 회사의 모든 문의 조회
     * - PRESIDENT → 자기 회사 소속 전체 문의 조회 (본인 + 소속 직원)
     * - EMPLOYEE  → 본인이 생성한 문의만 조회
     */
    public List<InquiryResponse> getInquiries(AuthUser loginUser) {
        List<Inquiry> inquiries;

        if ("ADMIN".equals(loginUser.role())) {
            inquiries = inquiryRepository.findAllOrderByLastMessageAtOrCreatedAt();
        } else if ("PRESIDENT".equals(loginUser.role())) {
            inquiries = inquiryRepository.findByCompanyId(loginUser.companyId());
        } else { // EMPLOYEE
            inquiries = inquiryRepository.findByCreatedByUserId(loginUser.userId());
        }

        return inquiries.stream()
                .map(inquiry -> {
                    // 유저별 안 읽은 메시지 개수 구하기
                    Long unreadCount = countUnreadMessages(inquiry.getInquiryId(), loginUser.userId());
                    return InquiryResponse.of(inquiry, unreadCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 2. 특정 문의방 단건/상세 조회 및 권한 검증
     */
    public InquiryResponse getInquiryDetail(Integer inquiryId, AuthUser loginUser) {
        Inquiry inquiry = getInquiryWithVerification(inquiryId, loginUser);
        Long unreadCount = countUnreadMessages(inquiryId, loginUser.userId());
        return InquiryResponse.of(inquiry, unreadCount);
    }

    /**
     * 3. 새 1:1 문의방 생성 (최초 등록)
     */
    @Transactional
    public InquiryResponse createInquiry(CreateInquiryRequest request, AuthUser loginUser) {
        User user = userRepository.findById(loginUser.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        Company company = companyRepository.findById(loginUser.companyId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));

        FaqCategory faqCategory = FaqCategory.valueOf(request.category());

        Inquiry inquiry = Inquiry.builder()
                .company(company)
                .createdByUser(user)
                .category(faqCategory)
                .title(request.title())
                .status(InquiryStatus.OPEN)
                .build();

        Inquiry savedInquiry = inquiryRepository.save(inquiry);
        return InquiryResponse.of(savedInquiry, 0L);
    }

    /**
     * 4. 특정 문의방의 과거 메시지 대화 내역 전체 조회
     */
    public List<InquiryMessageResponse> getInquiryMessages(Integer inquiryId, AuthUser loginUser) {
        // 권한 체크 선행
        getInquiryWithVerification(inquiryId, loginUser);

        List<InquiryMessage> messages = inquiryMessageRepository.findByInquiry_InquiryIdOrderByCreatedAtAsc(inquiryId);
        return messages.stream()
                .map(InquiryMessageResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 5. 문의방 실시간 채팅 메시지 저장 (웹소켓 전용)
     */
    @Transactional
    public InquiryMessageResponse saveChatMessage(Integer inquiryId, InquiryMessageRequest request, AuthUser loginUser) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문의방입니다."));

        User sender = userRepository.getReferenceById(loginUser.userId());

        // ADMIN이 아닌 경우, 본인 소속 회사의 방인지 정밀 권한 검증 추가 가능
        if (!"ADMIN".equals(loginUser.role()) && !inquiry.getCompany().getCompanyId().equals(loginUser.companyId())) {
            throw new IllegalArgumentException("해당 문의방에 메시지를 보낼 권한이 없습니다.");
        }

        // 최초로 ADMIN이 답변을 작성하는 시점이라면 해당 ADMIN을 담당자로 지정
        if ("ADMIN".equals(loginUser.role()) && inquiry.getAssignedAdmin() == null) {
            inquiry.assignAdmin(sender);
        }

        // 1) 메시지 객체 생성 및 저장
        InquiryMessage chatMessage = new InquiryMessage(inquiry, sender, request.message());
        InquiryMessage savedMessage = inquiryMessageRepository.save(chatMessage);

        // 2) Inquiry 엔티티 내재 비즈니스 메서드로 상태 전환 (WAITING or ANSWERED) 및 시간 갱신
        inquiry.updateLastMessage(sender, request.message());

        // 3) 보낸 사람은 자동으로 읽음 처리 기록 생성
        InquiryMessageRead messageRead = new InquiryMessageRead(savedMessage, sender);
        inquiryMessageReadRepository.save(messageRead);

        return InquiryMessageResponse.from(savedMessage);
    }

    /**
     * 6. 문의방 읽음 처리 (채팅방 진입 시 unreadCount 초기화)
     */
    @Transactional
    public void markAsRead(Integer inquiryId, AuthUser loginUser) {
        Inquiry inquiry = getInquiryWithVerification(inquiryId, loginUser);
        User user = userRepository.getReferenceById(loginUser.userId());
        // 이 방에 작성된 메시지 중 '내가 읽지 않은 메시지 목록'을 추출
        List<InquiryMessage> unreadMessages = inquiryMessageRepository.findUnreadMessagesByInquiryAndUser(inquiryId, loginUser.userId());

        // 읽음 처리 벌크 인서트 혹은 순회 저장
        for (InquiryMessage msg : unreadMessages) {
            if (!inquiryMessageReadRepository.existsByMessageAndUser(msg.getMessageId(), user.getUserId())) {
                inquiryMessageReadRepository.save(new InquiryMessageRead(msg, user));
            }
        }
    }

    /**
     * [공통 내부 메서드] 문의방 권한 유효성 검증 로직
     */
    private Inquiry getInquiryWithVerification(Integer inquiryId, AuthUser loginUser) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문의방입니다."));

        if ("ADMIN".equals(loginUser.role())) {
            return inquiry;
        }
        if ("PRESIDENT".equals(loginUser.role())) {
            if (!inquiry.getCompany().getCompanyId().equals(loginUser.companyId())) {
                throw new IllegalArgumentException("해당 소속 회사의 문의만 조회할 수 있습니다.");
            }
            return inquiry;
        }
        // EMPLOYEE
        if (!inquiry.getCreatedByUser().getUserId().equals(loginUser.userId())) {
            throw new IllegalArgumentException("본인이 작성한 문의만 접근할 수 있습니다.");
        }
        return inquiry;
    }

    /**
     * [공통 내부 메서드] 안 읽은 메시지 수 수식 계산
     * 전체 메시지 개수 - (해당 유저가 읽은 기록이 매핑된 메시지 개수)
     */
    private Long countUnreadMessages(Integer inquiryId, Integer userId) {
        Long totalMessages = inquiryMessageRepository.countByInquiryInquiryId(inquiryId);
        Long readMessages = inquiryMessageReadRepository.countByInquiryIdAndUserId(inquiryId, userId);
        return Math.max(0L, totalMessages - readMessages);
    }
}