package io.anas.contractpulse.contract;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractRepository extends JpaRepository<Contract, UUID> {

    List<Contract> findByUserId(UUID userId);

    Optional<Contract> findByPublicToken(UUID publicToken);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}