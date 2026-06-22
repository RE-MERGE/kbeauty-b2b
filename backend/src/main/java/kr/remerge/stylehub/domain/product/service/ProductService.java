package kr.remerge.stylehub.domain.product.service;

import kr.remerge.stylehub.domain.company.entity.Brand;
import kr.remerge.stylehub.domain.company.repository.BrandRepository;
import kr.remerge.stylehub.domain.product.dto.ProductDto;
import kr.remerge.stylehub.domain.product.entity.Category;
import kr.remerge.stylehub.domain.product.entity.Product;
import kr.remerge.stylehub.domain.product.repository.CategoryRepository;
import kr.remerge.stylehub.domain.product.repository.ProductRepository;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.repository.UserRepository;
import kr.remerge.stylehub.global.auth.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    // [CREATE] 상품 등록
    @Transactional
    public ProductDto.DetailResponse create(CustomUserDetails userDetails, ProductDto.CreateRequest request) {
        User seller = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new IllegalArgumentException("브랜드를 찾을 수 없습니다."));

        Product product = Product.builder()
                .seller(seller)
                .company(seller.getCompany())
                .category(category)
                .brand(brand)
                .productName(request.productName())
                .productEngName(request.productEngName())
                .returnPolicy(request.returnPolicy())
                .season(request.season())
                .moq(request.moq())
                .unitPrice(request.unitPrice())
                .leadTimeDays(request.leadTimeDays())
                .mainMaterial(request.mainMaterial())
                .materialCert(request.materialCert())
                .description(request.description())
                .careInstruction(request.careInstruction())
                .productUrl(request.productUrl())
                .oemAvailable(request.oemAvailable() != null ? request.oemAvailable() : false)
                .sampleAvailable(request.sampleAvailable() != null ? request.sampleAvailable() : false)
                .whiteLabel(request.whiteLabel() != null ? request.whiteLabel() : false)
                .build();

        return ProductDto.DetailResponse.from(productRepository.save(product));
    }

    // [READ] 전체 상품 목록
    public List<ProductDto.SummaryResponse> getAll() {
        return productRepository.findAll()
                .stream()
                .map(ProductDto.SummaryResponse::from)
                .toList();
    }

    // [READ] 상품 단건 조회
    public ProductDto.DetailResponse getById(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        return ProductDto.DetailResponse.from(product);
    }

    // [READ] 내 상품 목록 (셀러용)
    public List<ProductDto.SummaryResponse> getMy(CustomUserDetails userDetails) {
        return productRepository.findBySeller_UserId(userDetails.getUserId())
                .stream()
                .map(ProductDto.SummaryResponse::from)
                .toList();
    }

    // [UPDATE] 상품 수정
    @Transactional
    public ProductDto.DetailResponse update(Integer productId, ProductDto.UpdateRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        product.update(request);
        return ProductDto.DetailResponse.from(product);
    }

    // [DELETE] 상품 삭제
    @Transactional
    public void delete(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        productRepository.delete(product);
    }
}
