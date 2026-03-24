package io.anas.contractpulse.invoice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByMilestoneId(UUID milestoneId);

    boolean existsByMilestoneId(UUID milestoneId);

    List<Invoice> findByStatus(Invoice.Status status);
}