package io.anas.contractpulse.dashboard;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class DashboardStats {
    private long totalContracts;
    private long activeContracts;
    private long pendingInvoices;
    private BigDecimal totalEarned;
}