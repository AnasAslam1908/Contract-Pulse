package io.anas.contractpulse.portal;

import io.anas.contractpulse.contract.Contract;
import io.anas.contractpulse.contract.ContractService;
import io.anas.contractpulse.milestone.Milestone;
import io.anas.contractpulse.milestone.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortalService {

    private final ContractService contractService;
    private final MilestoneRepository milestoneRepository;

    public PortalResponse getPortalData(UUID token) {
        Contract contract = contractService.getContractByPublicToken(token);
        List<Milestone> milestones = milestoneRepository
                .findByContractIdOrderByOrderIndexAsc(contract.getId());

        return PortalResponse.builder()
                .contractTitle(contract.getTitle())
                .clientName(contract.getClient().getName())
                .freelancerName(contract.getUser().getName())
                .status(contract.getStatus().name())
                .totalValue(contract.getTotalValue())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .milestones(milestones)
                .build();
    }
}