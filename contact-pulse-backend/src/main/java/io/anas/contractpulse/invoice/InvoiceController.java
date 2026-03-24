package io.anas.contractpulse.invoice;

import io.anas.contractpulse.user.User;
import io.anas.contractpulse.user.UserRepository;
import io.anas.contractpulse.user.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository;
    private final PdfService pdfService;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow();
    }
    @PostMapping("/generate/{milestoneId}")
    public ResponseEntity<Invoice> generateInvoice(@PathVariable UUID milestoneId,@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201)
                .body(invoiceService.generateInvoice(milestoneId, getUser(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoice(@PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable UUID id,
                                                @RequestParam Invoice.Status status,@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, status, getUser(userDetails)));
    }



    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID id,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        byte[] pdf = pdfService.generateInvoicePdf(id, getUser(userDetails));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
    @GetMapping
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                invoiceService.getAllInvoicesForUser(getUser(userDetails)));
    }
    @GetMapping("/overdue-invoices")
    @Transactional
    public ResponseEntity<List<InvoiceResponse>> getOverdueInvoices(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                invoiceService.getOverdueInvoicesForUser(getUser(userDetails)));
    }
}