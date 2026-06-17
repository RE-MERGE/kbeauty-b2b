package kr.remerge.stylehub.domain.user;

import kr.remerge.stylehub.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    // 이메일로 유저 조회 (로그인, 중복 체크 등에서 사용)
    Optional<User> findByEmail(String email);
}