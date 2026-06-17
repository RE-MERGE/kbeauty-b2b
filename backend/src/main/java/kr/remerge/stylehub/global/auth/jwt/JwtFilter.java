package kr.remerge.stylehub.global.auth.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.remerge.stylehub.global.auth.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/*
───────────────────────────────────────────
전체 흐름 ──────────────────────────────────────
───────────────────────────────────────────
HTTP 요청
    ↓
JwtFilter.doFilterInternal()
    ↓
resolveToken()                                 # Authorization 헤더에서 토큰 추출
    ↓
jwtProvider.validateToken()                    # 유효한지 검증
    ↓
customUserDetailsService.loadUserByUsername()  # DB에서 유저 로드
    ↓
SecurityContextHolder에 인증 정보 저장
    ↓
Controller 도달 → @AuthenticationPrincipal로 유저 꺼내 쓰기
───────────────────────────────────────────
만료 시 클라이언트 흐름 ───────────────────────────────
───────────────────────────────────────────
액세스 토큰 만료 → 401 응답
    ↓
React에서 감지
↓
/api/auth/refresh 요청 (리프레시 토큰 전달)
    ↓
새 액세스 토큰 발급
*/
// 모든 HTTP 요청마다 딱 한 번 실행되는 JWT 인증 필터
// OncePerRequestFilter : 요청당 1번만 실행을 보장하는 Spring 필터 베이스 클래스
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService customUserDetailsService;

    // ───────────────────────────────────────────
    // 핵심 필터 로직
    // ───────────────────────────────────────────

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. 요청 헤더에서 토큰 추출
        String token = resolveToken(request);

        // 2. 토큰이 없으면 그냥 다음 필터로 넘김
        //    (로그인, 회원가입 등 인증 불필요한 요청은 SecurityConfig에서 permitAll 처리)
        if (!StringUtils.hasText(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. 토큰 검증
        try {
            if (jwtProvider.validateToken(token)) {
                // 4. 토큰에서 userId 추출
                Integer userId = jwtProvider.getUserId(token);

                // 5. userId로 DB에서 유저 정보 로드
                //    CustomUserDetailsService가 UserDetails(CustomUserDetails) 반환
                UserDetails userDetails = customUserDetailsService.loadUserByUserId(userId);

                // 6. 인증 객체 생성
                //    UsernamePasswordAuthenticationToken : Spring Security의 인증 완료 객체
                //    세 번째 파라미터(authorities)가 있으면 '인증 완료' 상태로 처리됨
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,        // principal (현재 유저)
                                null,               // credentials (비밀번호, JWT에선 필요 없음)
                                userDetails.getAuthorities() // 권한 목록
                        );

                // [추가 스펙] 원격 IP 주소, 세션 정보 등 현재 요청의 웹 디테일을 인증 객체에 바인딩
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. SecurityContext에 인증 정보 저장
                //    이후 @AuthenticationPrincipal로 꺼내 쓸 수 있음
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (ExpiredJwtException e) {
            // 액세스 토큰 만료 → 클라이언트가 리프레시 토큰으로 재발급 요청해야 함
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\": \"액세스 토큰이 만료되었습니다.\"}");
            return; // 필터 체인 중단
        }

        // 8. 다음 필터로 넘김
        filterChain.doFilter(request, response);
    }

    // ───────────────────────────────────────────
    // 헤더에서 토큰 추출
    // ───────────────────────────────────────────

    // Authorization: Bearer {token} 형식에서 토큰만 꺼냄
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        // "Bearer "로 시작하는지 확인 후 그 뒤 토큰 문자열만 반환
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " 7글자 제거
        }
        return null;
    }
}