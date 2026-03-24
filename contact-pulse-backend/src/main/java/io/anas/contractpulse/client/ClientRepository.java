package io.anas.contractpulse.client;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {

    List<Client> findByUserId(UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}