package io.anas.contractpulse.invoice;

import io.anas.contractpulse.exception.BadRequestException;
import io.anas.contractpulse.exception.ResourceNotFoundException;
import io.anas.contractpulse.milestone.Milestone;
import io.anas.contractpulse.milestone.MilestoneService;
import io.anas.contractpulse.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final MilestoneService milestoneService;


    public Invoice generateInvoice(UUID milestoneId, User currentUser) {
        if (invoiceRepository.existsByMilestoneId(milestoneId)) {
            throw new BadRequestException("Invoice already exists for this milestone");
        }

        Milestone milestone = milestoneService.getMilestoneById(milestoneId, currentUser);

        String invoiceNumber = "INV-" + System.currentTimeMillis();

        Invoice invoice = Invoice.builder()
                .milestone(milestone)
                .invoiceNumber(invoiceNumber)
                .amount(milestone.getAmount())
                .status(Invoice.Status.PENDING)
                .build();

        return invoiceRepository.save(invoice);
    }

    public Invoice getInvoiceById(UUID id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    public Invoice updateStatus(UUID id, Invoice.Status status, User currentUser) {
        Invoice invoice = getInvoiceById(id);
        milestoneService.getMilestoneById(
                invoice.getMilestone().getId(), currentUser);
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getOverdueInvoices() {
        return invoiceRepository.findByStatus(Invoice.Status.OVERDUE);
    }

    public List<InvoiceResponse> getAllInvoicesForUser(User currentUser) {
        return invoiceRepository.findAll()
                .stream()
                .filter(inv -> inv.getMilestone()
                        .getContract()
                        .getUser()
                        .getId()
                        .equals(currentUser.getId()))
                .map(inv -> InvoiceResponse.builder()
                        .id(inv.getId())
                        .invoiceNumber(inv.getInvoiceNumber())
                        .amount(inv.getAmount())
                        .status(inv.getStatus().name())
                        .issuedDate(inv.getIssuedDate())
                        .dueDate(inv.getDueDate())
                        .contractTitle(inv.getMilestone().getContract().getTitle())
                        .milestoneTitle(inv.getMilestone().getTitle())
                        .contractId(inv.getMilestone().getContract().getId())
                        .milestoneId(inv.getMilestone().getId())
                        .createdAt(inv.getCreatedAt())
                        .build())
                .toList();
    }
    public List<InvoiceResponse> getOverdueInvoicesForUser(User currentUser) {
        return invoiceRepository.findByStatus(Invoice.Status.OVERDUE)
                .stream()
                .filter(inv -> inv.getMilestone()
                        .getContract()
                        .getUser()
                        .getId()
                        .equals(currentUser.getId()))
                .map(inv -> InvoiceResponse.builder()
                        .id(inv.getId())
                        .invoiceNumber(inv.getInvoiceNumber())
                        .amount(inv.getAmount())
                        .status(inv.getStatus().name())
                        .issuedDate(inv.getIssuedDate())
                        .dueDate(inv.getDueDate())
                        .contractTitle(inv.getMilestone().getContract().getTitle())
                        .milestoneTitle(inv.getMilestone().getTitle())
                        .contractId(inv.getMilestone().getContract().getId())
                        .milestoneId(inv.getMilestone().getId())
                        .createdAt(inv.getCreatedAt())
                        .build())
                .toList();
    }
}