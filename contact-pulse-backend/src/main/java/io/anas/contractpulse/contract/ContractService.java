package io.anas.contractpulse.contract;

import io.anas.contractpulse.client.Client;
import io.anas.contractpulse.client.ClientService;
import io.anas.contractpulse.exception.ResourceNotFoundException;
import io.anas.contractpulse.exception.UnauthorizedException;
import io.anas.contractpulse.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final ClientService clientService;

    public List<Contract> getAllContracts(User currentUser) {
        return contractRepository.findByUserId(currentUser.getId());
    }

    public Contract getContractById(UUID id, User currentUser) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (!contract.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        return contract;
    }

    public Contract getContractByPublicToken(UUID token) {
        return contractRepository.findByPublicToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
    }

    public Contract createContract(ContractRequest request, User currentUser) {
        Client client = clientService.getClientById(request.getClientId(), currentUser);

        Contract contract = Contract.builder()
                .user(currentUser)
                .client(client)
                .title(request.getTitle())
                .description(request.getDescription())
                .totalValue(request.getTotalValue())
                .status(Contract.Status.DRAFT)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        return contractRepository.save(contract);
    }

    public Contract updateStatus(UUID id, Contract.Status status, User currentUser) {
        Contract contract = getContractById(id, currentUser);
        contract.setStatus(status);
        return contractRepository.save(contract);
    }

    public void deleteContract(UUID id, User currentUser) {
        Contract contract = getContractById(id, currentUser);
        contractRepository.delete(contract);
    }
    public ContractResponse toResponse(Contract contract) {
        return ContractResponse.builder()
                .id(contract.getId())
                .title(contract.getTitle())
                .description(contract.getDescription())
                .clientId(contract.getClient().getId().toString())
                .clientName(contract.getClient().getName())
                .totalValue(contract.getTotalValue())
                .status(contract.getStatus().name())
                .publicToken(contract.getPublicToken())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .createdAt(contract.getCreatedAt())
                .build();
    }
}