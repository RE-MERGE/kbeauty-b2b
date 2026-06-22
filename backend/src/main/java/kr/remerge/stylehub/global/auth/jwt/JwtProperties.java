package kr.remerge.stylehub.global.auth.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

// application.yml의 jwt: 하위 값들을 자동으로 바인딩해주는 클래스
// @ConfigurationProperties : yml 파일의 prefix(jwt)에 해당하는 값들을 필드에 매핑
@Setter
@Getter
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    // Getter / Setter
    // @ConfigurationProperties는 Setter로 값을 주입하기 때문에 반드시 필요
    // jwt.secret = "your-secret-key" 값이 여기에 주입됨
    // 토큰 서명에 사용하는 비밀키 (절대 외부에 노출되면 안됨)
    private String secret;

    // jwt.access-token-expiration = 1800000 (30분, ms 단위)
    // 액세스 토큰 만료 시간
    private long accessTokenExpiration;

    // jwt.refresh-token-expiration = 1209600000 (14일, ms 단위)
    // 리프레시 토큰 만료 시간
    private long refreshTokenExpiration;

}

