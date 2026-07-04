package kr.remerge.stylehub.global.auth.security;

import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import org.springframework.core.MethodParameter;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

// @LoginUser 어노테이션이 붙은 파라미터를 가로채서
// SecurityContext에서 유저 정보를 꺼내 AuthUser로 변환해주는 클래스
@Component
public class LoginUserArgumentResolver implements HandlerMethodArgumentResolver {

    // 이 Resolver가 처리할 파라미터인지 판단
    // @LoginUser 어노테이션이 붙어있으면 true
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(LoginUser.class)
                && AuthUser.class.isAssignableFrom(parameter.getParameterType());
    }

    // 실제로 파라미터에 들어갈 값을 만들어서 반환
    @Override
    public Object resolveArgument(@NonNull MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  @NonNull NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof AuthUser) {
            return principal;
        }

        return null;
    }
}