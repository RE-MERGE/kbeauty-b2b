package kr.remerge.stylehub.global.common.hash;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class Sha256HashGenerator {

    public String hashText(String content) {
        return hashBytes(content.getBytes(StandardCharsets.UTF_8));
    }

    public String hashBytes(byte[] content) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(content);

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 해시 알고리즘을 사용할 수 없습니다",
                    exception);
        }
    }


}
