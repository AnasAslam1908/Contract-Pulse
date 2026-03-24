package io.anas.contractpulse.portal;

import io.anas.contractpulse.milestone.Milestone;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
public class PortalResponse {
    private String contractTitle;
    private String clientName;
    private String freelancerName;
    private String status;
    private BigDecimal totalValue;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Milestone> milestones;
}