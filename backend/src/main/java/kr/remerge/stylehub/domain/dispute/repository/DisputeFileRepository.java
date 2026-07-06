package kr.remerge.stylehub.domain.dispute.repository;

import kr.remerge.stylehub.domain.dispute.entity.DisputeFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisputeFileRepository extends JpaRepository<DisputeFile, Integer> {

    List<DisputeFile> findByDispute_DisputeIdOrderByCreatedAtAsc(Integer disputeId);
}
