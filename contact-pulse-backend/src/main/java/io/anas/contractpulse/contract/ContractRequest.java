package io.anas.contractpulse.contract;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter @Setter
public class ContractRequest {
    @NotBlank private String title;
    private String description;
    @NotNull private UUID clientId;
    @NotNull private BigDecimal totalValue;
    private LocalDate startDate;
    private LocalDate endDate;
}