package kr.remerge.stylehub.domain.dispute.service;

import kr.remerge.stylehub.domain.dispute.dto.DisputeDetailResponse;
import kr.remerge.stylehub.domain.dispute.dto.DisputeResponseCreateRequest;
import kr.remerge.stylehub.domain.dispute.dto.DisputeResponseItemResponse;
import kr.remerge.stylehub.domain.dispute.entity.Dispute;
import kr.remerge.stylehub.domain.dispute.entity.DisputeResponse;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeStatus;
import kr.remerge.stylehub.domain.dispute.enumtype.ResponderRole;
import kr.remerge.stylehub.domain.dispute.repository.DisputeRepository;
import kr.remerge.stylehub.domain.dispute.repository.DisputeResponseRepository;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.support.UserReader;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DisputeResponseService {

    private final DisputeRepository disputeRepository;
    private final DisputeResponseRepository disputeResponseRepository;
    private final UserReader userReader;

    public DisputeDetailResponse getBuyerDetail(
            Integer userId,
            Integer disputeId
    ) {
        User buyer = userReader.getUser(userId);
        Dispute dispute = findDispute(disputeId);

        validateBuyer(buyer, dispute);

        return createDetailResponse(dispute);
    }

    public DisputeDetailResponse getSellerDetail(
            Integer userId,
            Integer disputeId
    ) {
        User seller = userReader.getCompanyUser(userId);
        Dispute dispute = findDispute(disputeId);

        validateSellerCompany(seller, dispute);

        return createDetailResponse(dispute);
    }

    @Transactional
    public DisputeResponseItemResponse createBuyerResponse(
            Integer userId,
            Integer disputeId,
            DisputeResponseCreateRequest request
    ) {
        User buyer = userReader.getUser(userId);
        Dispute dispute = findDispute(disputeId);

        validateBuyer(buyer, dispute);
        validateResponseStatus(dispute, ResponderRole.BUYER);

        return saveResponse(
                dispute,
                buyer,
                ResponderRole.BUYER,
                request.content()
        );
    }

    @Transactional
    public DisputeResponseItemResponse createSellerResponse(
            Integer userId,
            Integer disputeId,
            DisputeResponseCreateRequest request
    ) {
        User seller = userReader.getCompanyUser(userId);
        Dispute dispute = findDispute(disputeId);

        validateSellerCompany(seller, dispute);
        validateResponseStatus(dispute, ResponderRole.SELLER);

        return saveResponse(
                dispute,
                seller,
                ResponderRole.SELLER,
                request.content()
        );
    }

    private DisputeResponseItemResponse saveResponse(
            Dispute dispute,
            User responder,
            ResponderRole responderRole,
            String content
    ) {
        DisputeStatus nextStatus =
                responderRole == ResponderRole.SELLER
                        ? DisputeStatus.WAITING_BUYER
                        : DisputeStatus.WAITING_SELLER;

        DisputeResponse response = disputeResponseRepository.save(
                new DisputeResponse(
                        dispute,
                        responder,
                        responderRole,
                        nextStatus,
                        content.trim()
                )
        );

        dispute.changeStatus(nextStatus);

        return DisputeResponseItemResponse.from(response);
    }

    private DisputeDetailResponse createDetailResponse(Dispute dispute) {
        List<DisputeResponse> responses =
                disputeResponseRepository
                        .findByDispute_DisputeIdOrderByCreatedAtAsc(
                                dispute.getDisputeId()
                        );

        return DisputeDetailResponse.from(dispute, responses);
    }

    private Dispute findDispute(Integer disputeId) {
        return disputeRepository.findById(disputeId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.DISPUTE_NOT_FOUND)
                );
    }

    private void validateBuyer(User buyer, Dispute dispute) {
        boolean isBuyer = Objects.equals(
                dispute.getBuyer().getUserId(),
                buyer.getUserId()
        );

        if (!isBuyer) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateSellerCompany(User seller, Dispute dispute) {
        boolean isSellerCompanyMember = Objects.equals(
                dispute.getSellerCompany().getCompanyId(),
                seller.getCompany().getCompanyId()
        );

        if (!isSellerCompanyMember) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateResponseStatus(
            Dispute dispute,
            ResponderRole responderRole
    ) {
        boolean canRespond =
                switch (responderRole) {
                    case SELLER ->
                            dispute.getStatus() == DisputeStatus.RECEIVED
                                    || dispute.getStatus()
                                    == DisputeStatus.WAITING_SELLER;
                    case BUYER ->
                            dispute.getStatus()
                                    == DisputeStatus.WAITING_BUYER;
                    case ADMIN -> false;
                };

        if (!canRespond) {
            throw new BusinessException(
                    ErrorCode.INVALID_DISPUTE_STATUS
            );
        }
    }
}