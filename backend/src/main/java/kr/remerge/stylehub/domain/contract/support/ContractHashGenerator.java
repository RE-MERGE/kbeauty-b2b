package kr.remerge.stylehub.domain.contract.support;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import kr.remerge.stylehub.domain.contract.entity.Contract;
import kr.remerge.stylehub.domain.contract.entity.ContractItem;
import kr.remerge.stylehub.global.common.hash.Sha256HashGenerator;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ContractHashGenerator {

    private final ObjectWriter objectWriter;
    private final Sha256HashGenerator sha256HashGenerator;


    public ContractHashGenerator(
            ObjectMapper objectMapper,
            Sha256HashGenerator sha256HashGenerator
    ) {

        this.objectWriter = objectMapper.copy()
                .configure(
                        MapperFeature.SORT_PROPERTIES_ALPHABETICALLY,
                        true
                )
                .writer();

        this.sha256HashGenerator = sha256HashGenerator;
    }

    public String generateHash(
            Contract contract,
            List<ContractItem> contractItems
    ) {
        ContractSnapshot snapshot
                = ContractSnapshot.from(contract, contractItems);

        try {
            String snapshotJson =
                    objectWriter.writeValueAsString(snapshot);

            return sha256HashGenerator.hashText(snapshotJson);

        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(
                    "계약 스냅샷을 생성하지 못했습니다.",
                    exception
            );
        }
    }

}
