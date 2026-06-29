package kr.remerge.stylehub.global.auth;

import kr.remerge.stylehub.domain.user.dto.response.FindIdResponse;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.repository.UserRepository;
import kr.remerge.stylehub.global.auth.dto.FindIdSendOtpRequest;
import kr.remerge.stylehub.global.auth.dto.FindIdVerifyOtpRequest;
import kr.remerge.stylehub.global.auth.dto.LoginRequest;
import kr.remerge.stylehub.global.auth.dto.TokenResponse;
import kr.remerge.stylehub.global.auth.jwt.JwtProperties;
import kr.remerge.stylehub.global.auth.jwt.JwtProvider;
import kr.remerge.stylehub.global.common.RedisRepository;
import kr.remerge.stylehub.global.common.service.SmsService;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RedisRepository redisRepository;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProperties jwtProperties;
    private final SmsService smsService;             // 알림톡 또는 SMS 발송 서비스


    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ───────────────────────────────────────────
    // 일반 로그인
    // ───────────────────────────────────────────
    @Transactional
    public TokenResponse login(LoginRequest request, String clientIp) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_LOGIN_CREDENTIALS));

        validateUserStatus(user);

        if (user.getFailedLoginAttempts() >= 5) {
            throw new BusinessException(ErrorCode.LOGIN_ATTEMPTS_EXCEEDED);
        }

        boolean passwordMatched = passwordEncoder.matches(request.password(), user.getPassword());

        if (!passwordMatched) {
            user.onLoginFailed();
            throw new BusinessException(ErrorCode.INVALID_LOGIN_CREDENTIALS);
        }

        user.onLoginSuccess(clientIp);

        String accessToken = jwtProvider.generateAccessToken(
                user.getUserId(),
                user.getCompany().getCompanyId(),
                user.getRole().name(),
                user.getBusinessRole().name()
        );
        String refreshToken = jwtProvider.generateRefreshToken(user.getUserId());

        redisRepository.save(
                refreshTokenKey(user.getUserId()),
                refreshToken,
                Duration.ofMillis(jwtProperties.getRefreshTokenExpiration())
        );

        return TokenResponse.of(accessToken, refreshToken);
    }

    // ───────────────────────────────────────────
    // 액세스 토큰 재발급 (Refresh)
    // ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public TokenResponse refresh(String refreshToken) {
        if (jwtProvider.isExpired(refreshToken)) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        Integer userId = jwtProvider.getUserId(refreshToken);

        String savedRefreshToken = redisRepository.get(refreshTokenKey(userId));
        if (savedRefreshToken == null || !savedRefreshToken.equals(refreshToken)) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        validateUserStatus(user);

        String newAccessToken = jwtProvider.generateAccessToken(
                user.getUserId(),
                user.getCompany().getCompanyId(),
                user.getRole().name(),
                user.getBusinessRole().name());

        return TokenResponse.of(newAccessToken, refreshToken);
    }

    // ───────────────────────────────────────────
    // 로그아웃 (Logout)
    // ───────────────────────────────────────────
    public void logout(Integer userId) {
        redisRepository.delete(refreshTokenKey(userId));
    }

    private void validateUserStatus(User user) {
        switch (user.getStatus()) {
            case PENDING -> throw new BusinessException(ErrorCode.USER_PENDING);
            case SUSPENDED -> throw new BusinessException(ErrorCode.USER_SUSPENDED);
            case DELETED -> throw new BusinessException(ErrorCode.USER_DELETED);
            default -> {}
        }
    }

    // ───────────────────────────────────────────
    // 아이디 찾기 - OTP 인증번호 발송
    // ───────────────────────────────────────────
    public void sendFindIdOtp(FindIdSendOtpRequest request) {
        // 1. 유저 존재 여부 확인 (UserRepository 바로 활용)
        if (!userRepository.existsByNameAndPhone(request.name(), request.phone())) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 2. 난수 생성 및 Redis 저장
        String otpCode = String.format("%06d", SECURE_RANDOM.nextInt(1000000));
        redisRepository.save("SMS_AUTH:" + request.phone(), otpCode, Duration.ofMinutes(3));

        // 3. 문자 발송
        String messageContent = "[StyleHub] 인증번호 [" + otpCode + "]를 입력해주세요.";
        boolean isSent = smsService.sendSms(request.phone(), messageContent);

        if (!isSent) {
            throw new BusinessException(ErrorCode.SMS_SEND_FAILED);
        }
    }

    // ───────────────────────────────────────────
    // 아이디 찾기 - OTP 인증번호 검증 및 결과 반환
    // ───────────────────────────────────────────
    public FindIdResponse verifyFindIdOtp(FindIdVerifyOtpRequest request) {
        // 1. Redis 기반 매칭 검증
        String savedCode = redisRepository.get("SMS_AUTH:" + request.phone());
        if (savedCode == null) {
            throw new BusinessException(ErrorCode.OTP_EXPIRED);
        }
        if (!savedCode.equals(request.code())) {
            throw new BusinessException(ErrorCode.INVALID_OTP_CODE);
        }

        // 검증 성공 시 즉시 삭제
        redisRepository.delete("SMS_AUTH:" + request.phone());

        // 2. 유저 정보 조회 및 결과 가공
        User user = userRepository.findByNameAndPhone(request.name(), request.phone())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 3. 이메일 마스킹 처리 후 최종 결과 반환
        return new FindIdResponse(maskEmail(user.getEmail()), user.getCreatedAt().toString());
    }

    // ───────────────────────────────────────────
    // 정보 변경을 위한 인증 코드 발송 및 검증 (마이페이지용)
    // ───────────────────────────────────────────
    public void sendChangeAuthCode(String target) {
        String otpCode = String.format("%06d", SECURE_RANDOM.nextInt(1000000));
        saveOtp("CHANGE_AUTH:" + target, otpCode);
    }

    public void verifyChangeAuthCode(String target, String code) {
        validateOtpCode("CHANGE_AUTH:" + target, code);
        redisRepository.save(verificationKey(target), "true", Duration.ofMinutes(10));
        redisRepository.delete("CHANGE_AUTH:" + target);
    }

    // ───────────────────────────────────────────
    // 회원정보 수정 시 '이메일 인증 여부' 검증 정책
    // ───────────────────────────────────────────
    public void validateVerification(String target) {
        if (isNotVerified(target)) {
            throw new BusinessException(ErrorCode.UNVERIFIED_EMAIL);
        }
        invalidateVerification(target);
    }

    public boolean isNotVerified(String target) {
        return !isVerified(target);
    }

    public boolean isVerified(String target) {
        String authStatus = redisRepository.get(verificationKey(target));
        return "true".equals(authStatus);
    }

    public void invalidateVerification(String target) {
        redisRepository.delete(verificationKey(target));
    }

    // ───────────────────────────────────────────
    // 내부 헬퍼 메서드 (Private Helpers)
    // ───────────────────────────────────────────
    private void validateOtpCode(String target, String code) {
        String savedCode = redisRepository.get(target);
        if (savedCode == null) {
            throw new BusinessException(ErrorCode.OTP_EXPIRED);
        }
        if (!savedCode.equals(code)) {
            throw new BusinessException(ErrorCode.INVALID_OTP_CODE);
        }
    }

    // 이메일 마스킹 헬퍼
    private String maskEmail(String email) {
        String[] parts = email.split("@");
        String id = parts[0];
        String domain = parts[1];
        if (id.length() <= 3) return id.replaceAll("\\.", "*") + "@" + domain;
        return id.substring(0, 2) + "***" + id.substring(id.length() - 2) + "@" + domain;
    }

    private void saveOtp(String target, String code) {
        redisRepository.save(target, code, Duration.ofMinutes(3));
    }

    private String verificationKey(String target) {
        return "VERIFIED:" + target;
    }

    private String refreshTokenKey(Integer userId) {
        return "REFRESH_TOKEN:" + userId;
    }
}