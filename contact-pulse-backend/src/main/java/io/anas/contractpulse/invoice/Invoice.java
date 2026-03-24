package io.anas.contractpulse.invoice;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.anas.contractpulse.milestone.Milestone;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id", nullable = false, unique = true)
    private Milestone milestone;

    @Column(nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(nullable = false)
    private LocalDate issuedDate;

    private LocalDate dueDate;

    @Column(length = 500)
    private String pdfPath;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        issuedDate = LocalDate.now();
        if (status == null) status = Status.PENDING;
    }

    public enum Status {
        PENDING, PAID, OVERDUE
    }
}