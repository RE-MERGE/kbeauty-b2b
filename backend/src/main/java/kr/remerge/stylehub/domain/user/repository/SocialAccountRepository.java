package kr.remerge.stylehub.domain.user.repository;

import kr.remerge.stylehub.domain.user.entity.SocialAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, Integer> {

}
