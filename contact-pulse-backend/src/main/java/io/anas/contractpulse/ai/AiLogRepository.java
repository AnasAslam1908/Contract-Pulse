package io.anas.contractpulse.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AiLogRepository extends JpaRepository<AiLog, UUID> {

    List<AiLog> findByContractId(UUID contractId);

    List<AiLog> findByContractIdAndFeatureType(UUID contractId, String featureType);
}