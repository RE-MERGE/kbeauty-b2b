package kr.remerge.stylehub.global.pdf;

import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.function.Consumer;

@Component
@RequiredArgsConstructor
public class PdfDocumentGenerator {

    private final KoreanPdfFontProvider koreanPdfFontProvider;

    public byte[] generate(Consumer<Document> contentWriter) {

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        try {
            PdfWriter writer =
                    new PdfWriter(outputStream);

            PdfDocument pdfDocument =
                    new PdfDocument(writer);

            try (Document document =
                         new Document(
                                 pdfDocument,
                                 PageSize.A4
                         )) {

                document.setFont(
                        koreanPdfFontProvider.createFont()
                );

                contentWriter.accept(document);
            }

            return outputStream.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "PDF 문서를 생성하지 못했습니다.",
                    exception
            );
        }
    }
}
