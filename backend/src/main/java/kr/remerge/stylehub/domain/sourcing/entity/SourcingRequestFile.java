package kr.remerge.stylehub.domain.sourcing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sourcing_request_files")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SourcingRequestFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sourcing_request_file_id")
    private Integer sourcingRequestFileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sourcing_request_id", nullable = false)
    private SourcingRequest sourcingRequest;

    @Column(name = "file_type", nullable = false, length = 20)
    private String fileType;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_url", nullable = false, length = 2000)
    private String fileUrl;

    @OneToMany(mappedBy = "sourcingRequest")
    private List<SourcingRequestFile> files = new ArrayList<>();
}
