package kr.remerge.stylehub.domain.support;

import kr.remerge.stylehub.domain.support.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Integer> {

    List<Notice> findAllByOrderByIsPinnedDescCreatedAtDesc();
}