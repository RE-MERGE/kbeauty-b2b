package kr.remerge.stylehub.domain.support.inquiry;

import jakarta.validation.Valid;
import kr.remerge.stylehub.domain.support.inquiry.dto.request.CreateInquiryRequest;
import kr.remerge.stylehub.domain.support.inquiry.dto.request.InquiryMessageRequest;
import kr.remerge.stylehub.domain.support.inquiry.dto.response.InquiryMessageResponse;
import kr.remerge.stylehub.domain.support.inquiry.dto.response.InquiryResponse;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/support/inquiries")
public class InquiryController {

    private final SimpMessagingTemplate messagingTemplate;
    private final InquiryService inquiryService;

    /**
     * 실시간 채팅 메시지 수신 및 브로드캐스팅
     * 클라이언트 발행 경로: /app/support/inquiry/{inquiryId}/message
     */
    @MessageMapping("/support/inquiry/{inquiryId}/message")
    public void handleInquiryMessage(
            @DestinationVariable("inquiryId") Integer inquiryId,
            @Payload @Valid InquiryMessageRequest request,
            Authentication authentication // Spring Security 인증된 유저 세션 정보 (이메일 혹은 ID 고유값)
    ) {
        // 인터셉터가 최초 CONNECT 시점에 꼽아준 AuthUser 객체를 메모리에서 그대로 꺼냅니다.
        AuthUser authUser = (AuthUser) authentication.getPrincipal();

        InquiryMessageResponse responseDto = inquiryService.saveChatMessage(inquiryId, request, authUser);

        // 2. 해당 문의방을 구독 중인 모든 클라이언트에게 가공된 DTO 전송
        // 구독 경로: /topic/support/inquiry/{inquiryId}
        messagingTemplate.convertAndSend("/topic/support/inquiry/" + inquiryId, responseDto);
    }

    /**
     * 1. 1:1 문의 내역 리스트 조회
     * (유저 권한 ADMIN/PRESIDENT/EMPLOYEE 에 따른 필터링은 서비스 내부에서 처리)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<InquiryResponse>>> getInquiries(@LoginUser AuthUser authUser) {
        List<InquiryResponse> response = inquiryService.getInquiries(authUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 2. 특정 문의방 단건/상세 조회
     */
    @GetMapping("/{inquiryId}")
    public ResponseEntity<ApiResponse<InquiryResponse>> getInquiryDetail(
            @PathVariable Integer inquiryId,
            @LoginUser AuthUser authUser
    ) {
        InquiryResponse response = inquiryService.getInquiryDetail(inquiryId, authUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 3. 새 1:1 문의방 작성 (최초 등록)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<InquiryResponse>> createInquiry(
            @RequestBody @Valid CreateInquiryRequest request,
            @LoginUser AuthUser authUser
    ) {
        InquiryResponse response = inquiryService.createInquiry(request, authUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 4. 특정 문의방의 과거 메시지 대화 내역 전체 조회
     * (웹소켓 연결 직후 대화창을 채우기 위해 기존 데이터를 가저오는 용도)
     */
    @GetMapping("/{inquiryId}/messages")
    public ResponseEntity<ApiResponse<List<InquiryMessageResponse>>> getInquiryMessages(
            @PathVariable Integer inquiryId,
            @LoginUser AuthUser authUser
    ) {
        List<InquiryMessageResponse> response = inquiryService.getInquiryMessages(inquiryId, authUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 5. 문의방 읽음 처리 (채팅방 진입 시 unreadCount 초기화용)
     * 테이블: inquiry_message_reads
     */
    @PostMapping("/{inquiryId}/read")
    public ResponseEntity<Void> readInquiryMessages(
            @PathVariable Integer inquiryId,
            @LoginUser AuthUser authUser
    ) {
        inquiryService.markAsRead(inquiryId, authUser);
        return ResponseEntity.noContent().build();
    }
}
