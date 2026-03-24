package io.anas.contractpulse.milestone;

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
@RequestMapping("/api/contracts/{contractId}/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow();
    }
    @GetMapping
    public ResponseEntity<List<Milestone>> getMilestones(@PathVariable UUID contractId,@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(milestoneService.getMilestones(contractId, getUser(userDetails)));
    }

    @PostMapping
    public ResponseEntity<Milestone> createMilestone(@PathVariable UUID contractId,
                                                     @Valid @RequestBody MilestoneRequest request,@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201)
                .body(milestoneService.createMilestone(contractId, request, getUser(userDetails)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Milestone> updateStatus(@PathVariable UUID contractId,
                                                  @PathVariable UUID id,
                                                  @RequestParam Milestone.Status status,@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(milestoneService.updateStatus(id, status, getUser(userDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable UUID contractId,
                                                @PathVariable UUID id,@AuthenticationPrincipal UserDetails userDetails) {
        milestoneService.deleteMilestone(id, getUser(userDetails));
        return ResponseEntity.noContent().build();
    }
}