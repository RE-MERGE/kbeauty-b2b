package kr.remerge.stylehub.domain.dispute.dto;

import kr.remerge.stylehub.domain.dispute.entity.DisputeFile;

import java.time.LocalDateTime;

public record DisputeFileResponse(
        Integer disputeFileId,
        Integer disputeResponseId,
        String fileName,
        String fileUrl,
        String fileType,
        Long fileSize,
        String uploadedByName,
        LocalDateTime createdAt
) {

    public static DisputeFileResponse from(DisputeFile file) {
        return new DisputeFileResponse(
                file.getDisputeFileId(),
                file.getDisputeResponse() == null
                        ? null
                        : file.getDisputeResponse().getDisputeResponseId(),
                file.getFileName(),
                file.getFileUrl(),
                file.getFileType(),
                file.getFileSize(),
                file.getUploadedBy().getName(),
                file.getCreatedAt()
        );
    }
}
