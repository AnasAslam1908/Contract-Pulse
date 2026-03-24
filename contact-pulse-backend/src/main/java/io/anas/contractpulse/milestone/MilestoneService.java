package io.anas.contractpulse.milestone;

import io.anas.contractpulse.contract.Contract;
import io.anas.contractpulse.contract.ContractService;
import io.anas.contractpulse.exception.ResourceNotFoundException;
import io.anas.contractpulse.exception.UnauthorizedException;
import io.anas.contractpulse.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ContractService contractService;

    public List<Milestone> getMilestones(UUID contractId, User currentUser) {
        contractService.getContractById(contractId, currentUser);
        return milestoneRepository.findByContractIdOrderByOrderIndexAsc(contractId);
    }

    public Milestone getMilestoneById(UUID id, User currentUser) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found"));

        if (!milestone.getContract().getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        return milestone;
    }

    public Milestone createMilestone(UUID contractId, MilestoneRequest request, User currentUser) {
        Contract contract = contractService.getContractById(contractId, currentUser);

        Milestone milestone = Milestone.builder()
                .contract(contract)
                .title(request.getTitle())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .orderIndex(request.getOrderIndex())
                .status(Milestone.Status.PENDING)
                .build();

        return milestoneRepository.save(milestone);
    }

    public Milestone updateStatus(UUID id, Milestone.Status status, User currentUser) {
        Milestone milestone = getMilestoneById(id, currentUser);
        milestone.setStatus(status);
        return milestoneRepository.save(milestone);
    }

    public void deleteMilestone(UUID id, User currentUser) {
        Milestone milestone = getMilestoneById(id, currentUser);
        milestoneRepository.delete(milestone);
    }
}