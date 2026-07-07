package kr.remerge.stylehub.domain.negotiation.dto;

import kr.remerge.stylehub.domain.negotiation.entity.NegotiationFile;

import java.time.LocalDateTime;

public record NegotiationFileResponse(
        Integer negotiationFileId,
        String fileName,
        String fileUrl,
        String fileType,
        Long fileSize,
        String uploadedByName,
        LocalDateTime createdAt
) {

    public static NegotiationFileResponse from(NegotiationFile file) {
        return new NegotiationFileResponse(
                file.getNegotiationFileId(),
                file.getFileName(),
                file.getFileUrl(),
                file.getFileType(),
                file.getFileSize(),
                file.getUploadedBy().getName(),
                file.getCreatedAt()
        );
    }
}
