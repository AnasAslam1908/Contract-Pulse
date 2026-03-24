package io.anas.contractpulse.invoice;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder
public class InvoiceResponse {
    private UUID id;
    private String invoiceNumber;
    private BigDecimal amount;
    private String status;
    private LocalDate issuedDate;
    private LocalDate dueDate;
    private String contractTitle;
    private String milestoneTitle;
    private UUID contractId;
    private UUID milestoneId;
    private LocalDateTime createdAt;
}