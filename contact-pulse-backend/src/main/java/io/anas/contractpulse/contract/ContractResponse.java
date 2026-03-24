package io.anas.contractpulse.contract;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder
public class ContractResponse {
    private UUID id;
    private String title;
    private String description;
    private String clientId;
    private String clientName;
    private BigDecimal totalValue;
    private String status;
    private UUID publicToken;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
}