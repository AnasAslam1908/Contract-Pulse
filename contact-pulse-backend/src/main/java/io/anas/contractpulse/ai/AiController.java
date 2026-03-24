package io.anas.contractpulse.ai;

import io.anas.contractpulse.user.User;
import io.anas.contractpulse.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow();
    }

    @GetMapping("/summary/{contractId}")
    public ResponseEntity<Map<String, String>> summarize(
            @PathVariable UUID contractId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String result = aiService.summarizeContract(contractId, getUser(userDetails));
        return ResponseEntity.ok(Map.of("summary", result));
    }

    @GetMapping("/risk/{contractId}")
    public ResponseEntity<Map<String, String>> assessRisk(
            @PathVariable UUID contractId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String result = aiService.assessPaymentRisk(contractId, getUser(userDetails));
        return ResponseEntity.ok(Map.of("risk", result));
    }

    @GetMapping("/followup/{invoiceId}")
    public ResponseEntity<Map<String, String>> followUp(
            @PathVariable UUID invoiceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String result = aiService.draftFollowUpEmail(invoiceId, getUser(userDetails));
        return ResponseEntity.ok(Map.of("email", result));
    }
}