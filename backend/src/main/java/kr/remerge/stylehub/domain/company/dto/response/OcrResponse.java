package kr.remerge.stylehub.domain.company.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public record OcrResponse(
        @JsonProperty("images") List<OcrImage> images
) {
    private static final Pattern BUSINESS_NUMBER_DASH_PATTERN = Pattern.compile("\\d{3}-\\d{2}-\\d{5}");
    private static final Pattern BUSINESS_NUMBER_PURE_PATTERN = Pattern.compile("\\d{10}");

    private static final Pattern COMPANY_NAME_FALLBACK_PATTERN = Pattern.compile("((?:주식회사|\\(주\\))\\s*[가-힣A-Za-z0-9]{2,20}|[가-힣A-Za-z0-9]{2,20}\\s*(?:주식회사|\\(주\\)))");

    private static final Pattern OPEN_DATE_DASH_PATTERN = Pattern.compile("(\\d{4})-(\\d{2})-(\\d{2})");
    private static final Pattern OPEN_DATE_KOREAN_PATTERN = Pattern.compile("(\\d{4})\\s*년\\s*(\\d{2})\\s*월\\s*(\\d{2})\\s*일");

    /**
     * 1. 사업자번호 추출
     */
    public String extractBusinessNumber() {
        String cleanText = getCleanCompressedText();
        Matcher matcher = BUSINESS_NUMBER_DASH_PATTERN.matcher(cleanText);
        if (matcher.find()) return matcher.group();

        matcher = BUSINESS_NUMBER_PURE_PATTERN.matcher(cleanText);
        return matcher.find() ? matcher.group() : "";
    }

    /**
     * 2. 회사명(상호/법인명) 추출
     */
    public String extractCompanyName() {
        String cleanText = getCleanCompressedText();

        // 텍스트 전체에서 '주식회사'나 '(주)' 형태를 가진 상호를 직접 추출
        Matcher matcher = COMPANY_NAME_FALLBACK_PATTERN.matcher(cleanText);
        if (matcher.find()) {
            return sanitize(matcher.group(1));
        }

        // 만약 주식회사가 없는 개인사업자라면 기존 방식 보완 레이아웃 가동
        Pattern companyNamePattern = Pattern.compile("(?:상호|법인명|단체명)[^가-힣A-Za-z0-9]*([가-힣A-Za-z0-9\\s]{2,20}?)(\\s|$|대표자)");
        matcher = companyNamePattern.matcher(cleanText);
        if (matcher.find()) {
            return sanitize(matcher.group(1));
        }

        return "";
    }

    /**
     * 3. 대표자명 추출
     */
    public String extractRepresentativeName() {
        String cleanText = getCleanCompressedText();

        // '대 표 자' 자간 공백 유연화 매칭
        Pattern representativeNamePattern = Pattern.compile("(?:대\\s*표\\s*자|성\\s*명)[:\\s]*([가-힣]{2,4})");
        Matcher matcher = representativeNamePattern.matcher(cleanText);
        if (matcher.find()) {
            return sanitize(matcher.group(1));
        }

        // 일반 OCR 텍스트 꼬임 대비: 개업연월일 근처나 텍스트 독립 한글 3자 추적기 (최후의 보루)
        Pattern nameFallback = Pattern.compile("(?<=법인명|단체명|대표자|성명)[^가-힣]*([가-힣]{2,4})");
        matcher = nameFallback.matcher(cleanText);
        if (matcher.find()) {
            return sanitize(matcher.group(1));
        }

        return "";
    }

    /**
     * 4. 개업일자 추출
     */
    public String extractOpenDate() {
        String cleanText = getCleanCompressedText();

        // 1순위: 이미지 속 '2018-04-17' 형태를 텍스트 전역에서 서칭
        Matcher matcher = OPEN_DATE_DASH_PATTERN.matcher(cleanText);
        if (matcher.find()) {
            return matcher.group(1) + "-" + matcher.group(2) + "-" + matcher.group(3);
        }

        // 2순위: '2018년 06월 21일' 형태 서칭
        matcher = OPEN_DATE_KOREAN_PATTERN.matcher(cleanText);
        if (matcher.find()) {
            return matcher.group(1) + "-" + matcher.group(2) + "-" + matcher.group(3);
        }

        return "";
    }

    private String getCleanCompressedText() {
        if (images == null || images.isEmpty() || images.get(0).fields() == null) return "";
        StringBuilder sb = new StringBuilder();
        for (OcrField field : images.get(0).fields()) {
            sb.append(field.inferText()).append(" ");
        }
        // 줄바꿈이나 중복 공백 노이즈를 완전 일렬로 정렬
        return sb.toString().replaceAll("\\s+", " ").trim();
    }

    private String sanitize(String input) {
        if (input == null) return "";
        return input.replaceAll("^[^가-힣A-Za-z0-9(]+", "").replaceAll("[^가-힣A-Za-z0-9)]+$", "").trim();
    }

    public record OcrImage(
            @JsonProperty("uid") String uid, @JsonProperty("name") String name,
            @JsonProperty("inferResult") String inferResult, @JsonProperty("message") String message,
            @JsonProperty("fields") List<OcrField> fields
    ) {
    }

    public record OcrField(
            @JsonProperty("inferText") String inferText, @JsonProperty("inferConfidence") double inferConfidence
    ) {
    }
}