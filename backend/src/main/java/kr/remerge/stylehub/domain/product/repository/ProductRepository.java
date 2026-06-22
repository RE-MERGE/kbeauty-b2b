package kr.remerge.stylehub.domain.product.repository;

import kr.remerge.stylehub.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    // 셀러별 상품 목록
    List<Product> findBySeller_UserId(Integer sellerId);

    // 카테고리별 상품 목록
    List<Product> findByCategory_CategoryId(Integer categoryId);

    // 브랜드별 상품 목록
    List<Product> findByBrand_BrandId(Integer brandId);
}