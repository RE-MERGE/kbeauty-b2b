package kr.remerge.stylehub.global.common.service;

import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SmsService {

    private final DefaultMessageService messageService;

    @Value("${coolsms.api.from}")
    private String fromNumber;

    public SmsService(
            @Value("${coolsms.api.key}") String apiKey,
            @Value("${coolsms.api.secret}") String apiSecret
    ) {
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");
    }

    /**
     * 오직 들어온 번호와 조립된 문자 내용을 CoolSMS로 전송만 하는 단순 메서드
     * 성공하면 true, 실패하면 false를 리턴하여 UserService가 흐름을 제어할 수 있게 만듭니다.
     */
    public boolean sendSms(String phone, String messageContent) {
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        // [테스트 모드] 특정 마스터 번호는 CoolSMS API를 찌르지 않고 무조건 발송 성공 처리
        if ("01000000000".equals(cleanPhone)) {
            log.info("[SMS 발송 우회 (테스트)] 수신처: 01000000000, 내용: {}", messageContent);
            return true; // API 호출 없이 즉시 성공 리턴!
        }

        // 1. CoolSMS 메시지 객체 생성 및 세팅
        Message message = new Message();
        message.setFrom(fromNumber);
        message.setTo(phone);
        message.setText(messageContent);

        try {
            // 2. 문자 발송 API 호출
            SingleMessageSentResponse response = this.messageService.sendOne(new SingleMessageSendingRequest(message));
            log.info("[SMS 발송 성공] 수신처: {}, 결과 코드: {}", phone, response.getStatusCode());
            return true;
        } catch (Exception e) {
            log.error("[SMS 발송 실패] 수신처: {}, 에러 원인: {}", phone, e.getMessage(), e);
            return false;
        }
    }

    /**
     * 1. 회원가입 전용 SMS 발송 위임
     */
    public void sendSignUpOtpSms(String phone, String otpCode) {
        String messageContent = "[StyleHub] 회원가입 인증번호 [" + otpCode + "]를 입력해주세요.";
        this.sendSms(phone, messageContent); // 기존 문자 발송 공통 메서드 호출
    }

    /**
     * 2. 아이디 찾기 전용 SMS 발송 위임
     */
    public boolean sendFindIdOtpSms(String phone, String otpCode) {
        String messageContent = "[StyleHub] 아이디 찾기 인증번호 [" + otpCode + "]를 입력해주세요.";
        return this.sendSms(phone, messageContent);
    }
}