package kr.remerge.stylehub.global.pdf;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

@Component
public class KoreanPdfFontProvider {

    private static final String FONT_PATH =
            "fonts/NotoSansCJKkr-Regular.otf";

    public PdfFont createFont() {
        try (InputStream inputStream =
                new ClassPathResource(FONT_PATH).getInputStream()) {

            return PdfFontFactory.createFont(
                    inputStream.readAllBytes(),
                    PdfEncodings.IDENTITY_H,
                    PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED
            );

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "PDF 한글 폰트를 불러오지 못했습니다.",
                    exception);
        }
    }
}
