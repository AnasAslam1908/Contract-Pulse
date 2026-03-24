package io.anas.contractpulse.contract;

import io.anas.contractpulse.user.User;
import io.anas.contractpulse.user.UserRepository;
import io.anas.contractpulse.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow();
    }
    @GetMapping
    public ResponseEntity<List<ContractResponse>> getAllContracts(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                contractService.getAllContracts(getUser(userDetails))
                        .stream()
                        .map(contractService::toResponse)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> getContract(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                contractService.toResponse(
                        contractService.getContractById(id, getUser(userDetails)))
        );
    }

    @PostMapping
    public ResponseEntity<ContractResponse> createContract(
            @Valid @RequestBody ContractRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201).body(
                contractService.toResponse(
                        contractService.createContract(request, getUser(userDetails)))
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ContractResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam Contract.Status status,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                contractService.toResponse(
                        contractService.updateStatus(id, status, getUser(userDetails)))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable UUID id,@AuthenticationPrincipal UserDetails userDetails) {
        contractService.deleteContract(id, getUser(userDetails));
        return ResponseEntity.noContent().build();
    }
}