package io.anas.contractpulse.ai;

import io.anas.contractpulse.contract.Contract;
import io.anas.contractpulse.contract.ContractRepository;
import io.anas.contractpulse.exception.ResourceNotFoundException;
import io.anas.contractpulse.exception.UnauthorizedException;
import io.anas.contractpulse.invoice.Invoice;
import io.anas.contractpulse.invoice.InvoiceRepository;
import io.anas.contractpulse.milestone.Milestone;
import io.anas.contractpulse.milestone.MilestoneRepository;
import io.anas.contractpulse.user.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AiService {

    private final ChatClient.Builder chatClientBuilder;
    private final ContractRepository contractRepository;
    private final MilestoneRepository milestoneRepository;
    private final InvoiceRepository invoiceRepository;
    private final AiLogRepository aiLogRepository;

    private ChatClient chatClient() {
        return chatClientBuilder.build();
    }

    // ── Feature 1: Contract Summary ──────────────────────
    public String summarizeContract(UUID contractId, User currentUser) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (!contract.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        List<Milestone> milestones = milestoneRepository
                .findByContractIdOrderByOrderIndexAsc(contractId);

        String prompt = String.format("""
                Summarize this freelance contract in 2-3 clear sentences for a non-technical client.
                
                Contract Title: %s
                Description: %s
                Total Value: PKR %.2f
                Start Date: %s
                End Date: %s
                Milestones: %s
                """,
                contract.getTitle(),
                contract.getDescription(),
                contract.getTotalValue(),
                contract.getStartDate(),
                contract.getEndDate(),
                milestones.stream()
                        .map(m -> m.getTitle() + " (PKR " + m.getAmount() + ") - " + m.getStatus())
                        .toList()
        );

        String response = chatClient()
                .prompt(prompt)
                .call()
                .content();

        saveLog(contract, "SUMMARY", prompt, response);
        return response;
    }

    // ── Feature 2: Payment Risk Flag ─────────────────────
    public String assessPaymentRisk(UUID contractId, User currentUser) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (!contract.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        List<Milestone> milestones = milestoneRepository
                .findByContractIdOrderByOrderIndexAsc(contractId);

        String prompt = String.format("""
                You are a freelance payment risk analyst.
                Analyze these milestones and flag any that are at risk of late payment.
                For each at-risk milestone explain why briefly.
                Give an overall risk level: LOW, MEDIUM, or HIGH.
                
                Contract: %s
                Client: %s
                Milestones:
                %s
                """,
                contract.getTitle(),
                contract.getClient().getName(),
                milestones.stream()
                        .map(m -> String.format("- %s | Due: %s | Status: %s | Amount: PKR %s",
                                m.getTitle(), m.getDueDate(), m.getStatus(), m.getAmount()))
                        .toList()
        );

        String response = chatClient()
                .prompt(prompt)
                .call()
                .content();

        saveLog(contract, "RISK", prompt, response);
        return response;
    }

    // ── Feature 3: Follow-up Email Draft ─────────────────
    public String draftFollowUpEmail(UUID invoiceId, User currentUser) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        Milestone milestone = invoice.getMilestone();
        Contract contract = milestone.getContract();

        if (!contract.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        long daysOverdue = invoice.getDueDate() != null
                ? java.time.temporal.ChronoUnit.DAYS.between(
                invoice.getDueDate(),
                java.time.LocalDate.now())
                : 0;

        String prompt = String.format("""
                Write a polite but firm follow-up email for an overdue invoice.
                Keep it professional and concise — max 4 sentences.
                
                Freelancer: %s
                Client: %s
                Invoice Number: %s
                Amount: PKR %.2f
                Days Overdue: %d
                Milestone: %s
                """,
                contract.getUser().getName(),
                contract.getClient().getName(),
                invoice.getInvoiceNumber(),
                invoice.getAmount(),
                daysOverdue,
                milestone.getTitle()
        );

        String response = chatClient()
                .prompt(prompt)
                .call()
                .content();

        saveLog(contract, "FOLLOWUP", prompt, response);
        return response;
    }

    private void saveLog(Contract contract, String featureType,
                         String prompt, String response) {
        AiLog log = AiLog.builder()
                .contract(contract)
                .featureType(featureType)
                .prompt(prompt)
                .response(response)
                .build();
        aiLogRepository.save(log);
    }
}