package kr.remerge.stylehub.global.auth.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// Controller 메서드 파라미터에 붙이면 로그인한 유저 정보를 바로 주입받음
// 예: public ResponseEntity<?> getMe(@LoginUser LoginUserInfo loginUser)
@Target(ElementType.PARAMETER) // 메서드 파라미터에만 사용 가능
@Retention(RetentionPolicy.RUNTIME) // 런타임까지 어노테이션 정보 유지
public @interface LoginUser {
}
