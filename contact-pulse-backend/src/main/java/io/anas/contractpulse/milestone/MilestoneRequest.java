package io.anas.contractpulse.milestone;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
public class MilestoneRequest {
    @NotBlank private String title;
    @NotNull private BigDecimal amount;
    private LocalDate dueDate;
    private int orderIndex;
}