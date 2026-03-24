package io.anas.contractpulse.dashboard;

import io.anas.contractpulse.contract.ContractRepository;
import io.anas.contractpulse.invoice.Invoice;
import io.anas.contractpulse.invoice.InvoiceRepository;
import io.anas.contractpulse.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;

    public DashboardStats getStats(User currentUser) {
        List<io.anas.contractpulse.contract.Contract> contracts =
                contractRepository.findByUserId(currentUser.getId());

        long totalContracts = contracts.size();

        long activeContracts = contracts.stream()
                .filter(c -> c.getStatus() ==
                        io.anas.contractpulse.contract.Contract.Status.ACTIVE)
                .count();

        List<Invoice> pendingInvoicesList =
                invoiceRepository.findByStatus(Invoice.Status.PENDING);

        long pendingInvoices = pendingInvoicesList.stream()
                .filter(inv -> inv.getMilestone()
                        .getContract()
                        .getUser()
                        .getId()
                        .equals(currentUser.getId()))
                .count();

        BigDecimal totalEarned = invoiceRepository
                .findByStatus(Invoice.Status.PAID)
                .stream()
                .filter(inv -> inv.getMilestone()
                        .getContract()
                        .getUser()
                        .getId()
                        .equals(currentUser.getId()))
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardStats.builder()
                .totalContracts(totalContracts)
                .activeContracts(activeContracts)
                .pendingInvoices(pendingInvoices)
                .totalEarned(totalEarned)
                .build();
    }
}