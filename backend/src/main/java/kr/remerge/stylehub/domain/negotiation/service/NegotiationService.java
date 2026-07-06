package kr.remerge.stylehub.domain.negotiation.service;

import kr.remerge.stylehub.domain.contract.entity.Contract;
import kr.remerge.stylehub.domain.contract.enumtype.ContractStatus;
import kr.remerge.stylehub.domain.contract.repository.ContractRepository;
import kr.remerge.stylehub.domain.contract.service.ContractService;
import kr.remerge.stylehub.domain.negotiation.dto.NegotiationCreateRequest;
import kr.remerge.stylehub.domain.negotiation.dto.NegotiationFileResponse;
import kr.remerge.stylehub.domain.negotiation.dto.NegotiationListResponse;
import kr.remerge.stylehub.domain.negotiation.dto.NegotiationRequestDetailResponse;
import kr.remerge.stylehub.domain.negotiation.dto.NegotiationRespondRequest;
import kr.remerge.stylehub.domain.negotiation.entity.Negotiation;
import kr.remerge.stylehub.domain.negotiation.entity.NegotiationFile;
import kr.remerge.stylehub.domain.negotiation.entity.NegotiationRequest;
import kr.remerge.stylehub.domain.negotiation.repository.NegotiationFileRepository;
import kr.remerge.stylehub.domain.negotiation.repository.NegotiationRepository;
import kr.remerge.stylehub.domain.negotiation.repository.NegotiationRequestRepository;
import kr.remerge.stylehub.domain.order.entity.OrderLog;
import kr.remerge.stylehub.domain.order.enumtype.OrderProcessStep;
import kr.remerge.stylehub.domain.order.repository.OrderLogRepository;
import kr.remerge.stylehub.domain.order.repository.OrderRepository;
import kr.remerge.stylehub.domain.quote.constant.QuoteStatusCode;
import kr.remerge.stylehub.domain.quote.dto.QuoteReviseItem;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.entity.QuoteItem;
import kr.remerge.stylehub.domain.quote.repository.QuoteItemRepository;
import kr.remerge.stylehub.domain.quote.repository.QuoteRepository;
import kr.remerge.stylehub.domain.quote.service.QuoteService;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.support.UserReader;
import kr.remerge.stylehub.global.common.ImageUploadService;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NegotiationService {

    private final NegotiationRepository negotiationRepository;
    private final NegotiationRequestRepository negotiationRequestRepository;
    private final NegotiationFileRepository negotiationFileRepository;
    private final QuoteRepository quoteRepository;
    private final QuoteItemRepository quoteItemRepository;
    private final ContractRepository contractRepository;
    private final QuoteService quoteService;
    private final ContractService contractService;
    private final UserReader userReader;
    private final OrderRepository orderRepository;
    private final OrderLogRepository orderLogRepository;
    private final ImageUploadService imageUploadService;

    public List<NegotiationListResponse> getNegotiationList(Integer userId) {

        List<Negotiation> negotiations =
                negotiationRepository
                        .findByBuyer_UserIdOrSeller_UserIdOrderByUpdatedAtDesc(
                                userId,
                                userId
                        );

        if (negotiations.isEmpty()) {
            return List.of();
        }

        List<Integer> negotiationIds = negotiations.stream()
                .map(Negotiation::getNegotiationId)
                .toList();

        Map<Integer, NegotiationRequest> latestRequestByNegotiationId =
                new HashMap<>();

        negotiationRequestRepository
                .findByNegotiation_NegotiationIdInOrderByCreatedAtDesc(
                        negotiationIds
                )
                .forEach(request ->
                        latestRequestByNegotiationId.putIfAbsent(
                                request.getNegotiation()
                                        .getNegotiationId(),
                                request
                        )
                );

        return negotiations.stream()
                .map(negotiation ->
                        NegotiationListResponse.from(
                                negotiation,
                                latestRequestByNegotiationId.get(
                                        negotiation.getNegotiationId()
                                )
                        )
                )
                .toList();

    }

    @Transactional
    public void createNegotiation(Integer userId, NegotiationCreateRequest request) {

        if ("CONTRACT".equals(request.negotiationType())) {
            createContractNegotiation(userId, request);
        } else {
            createQuoteNegotiation(userId, request);
        }
    }

    private void createQuoteNegotiation(Integer userId, NegotiationCreateRequest request) {

        if (request.quoteId() == null) {
            throw new BusinessException(ErrorCode.QUOTE_NOT_FOUND);
        }

        Quote quote =
                quoteRepository
                        .findByQuoteIdAndBuyer_UserId(request.quoteId(), userId)
                        .orElseThrow(
                                () -> new BusinessException(ErrorCode.QUOTE_NOT_FOUND)
                        );

        User buyer = userReader.getUser(userId);
        User seller = userReader.getUser(quote.getSeller().getUserId());

        Negotiation negotiation = negotiationRepository
                .findFirstByQuote_QuoteIdAndBuyer_UserIdAndStatusOrderByOpenedAtDesc(
                        request.quoteId(),
                        userId,
                        "OPEN"
                )
                .orElseGet(() ->
                        negotiationRepository.save(
                                new Negotiation(
                                        "QUOTE",
                                        quote,
                                        null,
                                        buyer,
                                        seller,
                                        quote.getProductName()
                                                + " 견적 조건 협의"
                                )
                        )
                );

        // 이전 라운드에서 셀러가 이미 새 버전 견적으로 응답했다면, 이번 라운드는 그 최신 버전을
        // 기준으로 잡아야 parentQuote/version 체인이 v1→v2→v3로 이어진다. 그렇지 않으면 매 라운드가
        // 항상 원본(v1)에서 다시 갈라져서 서로 다른 행이 같은 version 번호를 갖게 되는 충돌이 생긴다.
        Quote currentQuote = negotiationRequestRepository
                .findFirstByNegotiation_NegotiationIdOrderByCreatedAtDesc(negotiation.getNegotiationId())
                .map(lastRequest -> lastRequest.getRevisedQuote() != null
                        ? lastRequest.getRevisedQuote()
                        : quote)
                .orElse(quote);

        negotiationRequestRepository.save(
                new NegotiationRequest(
                        negotiation,
                        currentQuote,
                        null,
                        request.content().trim()
                )
        );

        negotiation.markRequested();

        if (QuoteStatusCode.SUBMITTED.equals(currentQuote.getStatus())) {
            currentQuote.changeStatus(QuoteStatusCode.NEGOTIATING);
        }

        orderRepository.
                findByQuote_QuoteIdInAndBuyer_UserIdAndIsSampleTrueOrderByCreatedAtDesc(
                List.of(quote.getQuoteId()),
                userId
        ).stream().findFirst().ifPresent(sampleOrder ->
                orderLogRepository.save(
                        OrderLog.createProcessLog(
                                sampleOrder,
                                OrderProcessStep.SAMPLE_NEGOTIATING,
                                buyer,
                                "샘플 확인 후 재협의가 요청되었습니다."
                        )
                )
        );
    }

    // 계약서(셀러 서명 후 바이어 검토 단계)에 대해 조건 변경을 요청하는 협의.
    // 바이어가 서명하기 전, SELLER_SIGNED 상태의 계약서에 대해서만 요청할 수 있다.
    private void createContractNegotiation(Integer userId, NegotiationCreateRequest request) {

        if (request.contractId() == null) {
            throw new BusinessException(ErrorCode.CONTRACT_NOT_FOUND);
        }

        Contract contract = contractRepository
                .findByContractIdAndQuote_Buyer_UserId(request.contractId(), userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONTRACT_NOT_FOUND));

        Quote quote = contract.getQuote();
        User buyer = userReader.getUser(userId);
        User seller = userReader.getUser(quote.getSeller().getUserId());

        Negotiation negotiation = negotiationRepository
                .findFirstByContract_ContractIdAndBuyer_UserIdAndStatusOrderByOpenedAtDesc(
                        request.contractId(),
                        userId,
                        "OPEN"
                )
                .orElseGet(() ->
                        negotiationRepository.save(
                                new Negotiation(
                                        "CONTRACT",
                                        quote,
                                        contract,
                                        buyer,
                                        seller,
                                        (contract.getContractName() != null
                                                ? contract.getContractName()
                                                : quote.getProductName())
                                                + " 계약 조건 협의"
                                )
                        )
                );

        // Quote와 동일한 이유: 이전 라운드에서 이미 재계약(revisedContract)이 나왔다면
        // 그 최신 버전을 기준으로 검증/연결해야 한다. (원본 계약은 createRevisedDraft에서 이미 CANCELED 처리됨)
        Contract currentContract = negotiationRequestRepository
                .findFirstByNegotiation_NegotiationIdOrderByCreatedAtDesc(negotiation.getNegotiationId())
                .map(lastRequest -> lastRequest.getRevisedContract() != null
                        ? lastRequest.getRevisedContract()
                        : contract)
                .orElse(contract);

        if (currentContract.getStatus() != ContractStatus.SELLER_SIGNED) {
            throw new BusinessException(ErrorCode.INVALID_CONTRACT_STATUS);
        }

        negotiationRequestRepository.save(
                new NegotiationRequest(
                        negotiation,
                        null,
                        currentContract,
                        request.content().trim()
                )
        );

        negotiation.markRequested();
    }

    // 셀러가 협의 요청에 재견적/재계약으로 응답한다.
    @Transactional
    public void respondToNegotiation(
            Integer sellerUserId,
            Integer negotiationRequestId,
            NegotiationRespondRequest request
    ) {

        NegotiationRequest negotiationRequest = negotiationRequestRepository
                .findById(negotiationRequestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEGOTIATION_REQUEST_NOT_FOUND));

        Negotiation negotiation = negotiationRequest.getNegotiation();

        if (!Objects.equals(negotiation.getSeller().getUserId(), sellerUserId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (!"REQUESTED".equals(negotiationRequest.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_NEGOTIATION_STATUS);
        }

        if ("CONTRACT".equals(negotiation.getNegotiationType())) {

            if (request.contractName() == null
                    || request.deliveryDate() == null
                    || request.paymentTerms() == null
                    || request.returnPolicy() == null) {
                throw new BusinessException(ErrorCode.INVALID_INPUT);
            }

            Contract originalContract = negotiationRequest.getRequestedContract();

            Long contractAmount = request.contractAmount() != null
                    ? request.contractAmount()
                    : originalContract.getContractAmount();

            Contract revisedContract = contractService.createRevisedDraft(
                    originalContract,
                    request.contractName(),
                    request.deliveryDate(),
                    request.paymentTerms(),
                    request.returnPolicy(),
                    request.specialTerms(),
                    contractAmount
            );

            negotiationRequest.respondWithContract(revisedContract, request.sellerMemo());

        } else {

            if (request.leadTimeDays() == null
                    || request.shippingFee() == null
                    || request.validUntil() == null
                    || request.items() == null
                    || request.items().isEmpty()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT);
            }

            Quote originalQuote = negotiationRequest.getRequestedQuote();

            List<QuoteReviseItem> items = request.items().stream()
                    .map(item -> new QuoteReviseItem(
                            item.optionSummary(),
                            item.quantity(),
                            item.unitPrice(),
                            item.sample()
                    ))
                    .toList();

            Quote revisedQuote = quoteService.createRevisedQuote(
                    originalQuote,
                    request.leadTimeDays(),
                    request.shippingFee(),
                    request.validUntil(),
                    request.sellerMemo(),
                    items
            );

            negotiationRequest.respondWithQuote(revisedQuote, request.sellerMemo());
        }
    }

    // 바이어가 셀러의 응답(재견적/재계약)을 수락한다.
    @Transactional
    public void acceptNegotiationRequest(Integer buyerUserId, Integer negotiationRequestId) {

        NegotiationRequest negotiationRequest = findRequestForBuyer(buyerUserId, negotiationRequestId);

        if (!"RESPONDED".equals(negotiationRequest.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_NEGOTIATION_STATUS);
        }

        negotiationRequest.accept();
        negotiationRequest.getNegotiation().agree();

        if (negotiationRequest.getRevisedQuote() != null) {
            negotiationRequest.getRevisedQuote().changeStatus(QuoteStatusCode.APPROVED);
        }
    }

    // 바이어가 셀러의 응답(재견적/재계약)을 거절한다.
    @Transactional
    public void rejectNegotiationRequest(Integer buyerUserId, Integer negotiationRequestId) {

        NegotiationRequest negotiationRequest = findRequestForBuyer(buyerUserId, negotiationRequestId);

        if (!"RESPONDED".equals(negotiationRequest.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_NEGOTIATION_STATUS);
        }

        negotiationRequest.cancel();
        negotiationRequest.getNegotiation().close();
    }

    private NegotiationRequest findRequestForBuyer(Integer buyerUserId, Integer negotiationRequestId) {

        NegotiationRequest negotiationRequest = negotiationRequestRepository
                .findById(negotiationRequestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEGOTIATION_REQUEST_NOT_FOUND));

        if (!Objects.equals(
                negotiationRequest.getNegotiation().getBuyer().getUserId(),
                buyerUserId
        )) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return negotiationRequest;
    }

    // 협의 스레드의 라운드별 이력(요청 -> 응답)을 시간순으로 조회한다.
    public List<NegotiationRequestDetailResponse> getNegotiationRequests(
            Integer userId,
            Integer negotiationId
    ) {

        Negotiation negotiation = negotiationRepository.findById(negotiationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEGOTIATION_NOT_FOUND));

        boolean isParty = Objects.equals(negotiation.getBuyer().getUserId(), userId)
                || Objects.equals(negotiation.getSeller().getUserId(), userId);

        if (!isParty) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        List<NegotiationRequest> requests = negotiationRequestRepository
                .findByNegotiation_NegotiationIdOrderByCreatedAtAsc(negotiationId);

        return requests.stream()
                .map(request -> NegotiationRequestDetailResponse.from(
                        request,
                        findQuoteItems(request.getRequestedQuote()),
                        findQuoteItems(request.getRevisedQuote())
                ))
                .toList();
    }

    private List<QuoteItem> findQuoteItems(Quote quote) {
        if (quote == null) {
            return List.of();
        }

        return quoteItemRepository.findByQuote_QuoteId(quote.getQuoteId());
    }

    // 협의 요청에 파일을 첨부한다. 해당 협의의 바이어/셀러만 업로드할 수 있다.
    @Transactional
    public NegotiationFileResponse uploadFile(
            Integer userId,
            Integer negotiationRequestId,
            MultipartFile file
    ) {

        NegotiationRequest negotiationRequest = negotiationRequestRepository
                .findById(negotiationRequestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEGOTIATION_REQUEST_NOT_FOUND));

        Negotiation negotiation = negotiationRequest.getNegotiation();

        boolean isParty = Objects.equals(negotiation.getBuyer().getUserId(), userId)
                || Objects.equals(negotiation.getSeller().getUserId(), userId);

        if (!isParty) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        User uploader = userReader.getUser(userId);

        String fileUrl = imageUploadService.upload(
                file,
                "negotiations/" + negotiationRequestId
        );

        NegotiationFile negotiationFile = negotiationFileRepository.save(
                new NegotiationFile(
                        negotiationRequest,
                        uploader,
                        file.getOriginalFilename(),
                        fileUrl,
                        file.getContentType(),
                        file.getSize()
                )
        );

        return NegotiationFileResponse.from(negotiationFile);
    }

    public List<NegotiationFileResponse> getFiles(Integer userId, Integer negotiationRequestId) {

        NegotiationRequest negotiationRequest = negotiationRequestRepository
                .findById(negotiationRequestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEGOTIATION_REQUEST_NOT_FOUND));

        Negotiation negotiation = negotiationRequest.getNegotiation();

        boolean isParty = Objects.equals(negotiation.getBuyer().getUserId(), userId)
                || Objects.equals(negotiation.getSeller().getUserId(), userId);

        if (!isParty) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return negotiationFileRepository
                .findByNegotiationRequest_NegotiationRequestIdOrderByCreatedAtAsc(negotiationRequestId)
                .stream()
                .map(NegotiationFileResponse::from)
                .toList();
    }
}
