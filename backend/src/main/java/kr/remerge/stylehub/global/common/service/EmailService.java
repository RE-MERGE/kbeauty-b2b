package kr.remerge.stylehub.global.common.service;

import jakarta.mail.internet.MimeMessage;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * 공통 HTML 메일 발송 메서드
     */
    public void sendHtmlEmail(String to, String subject, String content) {
        log.info("[메일 발송 요청] 수신처: {}, 제목: {}", to, subject);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            // true: 멀티파트 메시지 지원 (HTML 및 이미지/첨부 등)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true를 주어야 HTML 태그가 정상 렌더링됩니다.

            mailSender.send(message);
            log.info("[메일 발송 완료] 수신처: {}", to);

        } catch (Exception e) {
            log.error("[메일 발송 실패] 수신처: {}, 에러: {}", to, e.getMessage(), e);
            // 메일 발송 실패 시 커스텀 예외 발생
            throw new BusinessException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    /**
     * 회원가입 - 인증번호 메일 발송
     */
    public void sendSignUpVerificationEmail(String email, String otpCode) {
        String subject = "[StyleHub] 회원가입 인증번호 안내";
        String htmlContent = """
                <div style='margin:20px; padding:20px; border:1px solid #e2e8f0; border-radius:12px; max-width: 500px;'>
                    <h2 style='color: #0F172A; font-size: 20px; margin-bottom: 8px;'>안녕하세요, StyleHub입니다.</h2>
                    <p style='color: #475569; font-size: 14px;'>StyleHub 회원가입을 위한 본인 확인 인증번호입니다.<br/>아래의 인증번호를 제한 시간 내에 입력해 주세요.</p>
                    <div style='font-size:32px; font-weight:bold; color:#10B981; letter-spacing:4px; margin:24px 0; text-align:center; background-color:#F8FAFC; padding:12px; border-radius:8px;'>
                        %s
                    </div>
                    <p style='color: #94A3B8; font-size: 12px; margin-top: 16px;'>※ 인증번호 유효 시간은 <b>3분</b>입니다.</p>
                </div>
                """.formatted(otpCode);

        // 기존에 존재하던 기본 공통 발송 매직 메서드 호출
        sendHtmlEmail(email, subject, htmlContent);
    }

    /**
     * 비밀번호 찾기 - 인증번호 메일 발송
     */
    public void sendFindPasswordEmail(String email, String otpCode) {
        String subject = "[StyleHub] 비밀번호 찾기 인증번호 안내";
        String htmlContent = """
                <div style='margin:20px; padding:20px; border:1px solid #e2e8f0; border-radius:12px; max-width: 500px;'>
                    <h2 style='color: #0F172A; font-size: 20px; margin-bottom: 8px;'>안녕하세요, StyleHub입니다.</h2>
                    <p style='color: #475569; font-size: 14px;'>본인 확인을 위한 비밀번호 찾기 인증번호입니다.<br/>아래의 인증번호를 제한 시간 내에 입력해 주세요.</p>
                    <div style='font-size:32px; font-weight:bold; color:#2563EB; letter-spacing:4px; margin:24px 0; text-align:center; background-color:#F8FAFC; padding:12px; border-radius:8px;'>
                        %s
                    </div>
                    <p style='color: #94A3B8; font-size: 12px; margin-top: 16px;'>※ 인증번호 유효 시간은 <b>5분</b>입니다.</p>
                </div>
                """.formatted(otpCode); // 비밀번호 찾기는 파란색 계열(#2563EB) 디자인

        // 공통 HTML 발송 메서드 호출
        sendHtmlEmail(email, subject, htmlContent);
    }
}