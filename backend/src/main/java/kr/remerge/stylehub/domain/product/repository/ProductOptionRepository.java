package kr.remerge.stylehub.domain.product.repository;

import kr.remerge.stylehub.domain.product.entity.ProductOption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductOptionRepository extends JpaRepository<ProductOption, Integer> {
}
