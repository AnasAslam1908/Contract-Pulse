package io.anas.contractpulse.invoice;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import io.anas.contractpulse.exception.ResourceNotFoundException;
import io.anas.contractpulse.exception.UnauthorizedException;
import io.anas.contractpulse.user.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class PdfService {

    private final InvoiceRepository invoiceRepository;

    @Value("${app.storage.invoice-dir}")
    private String invoiceDir;

    private static final DeviceRgb PRIMARY   = new DeviceRgb(37, 99, 235);
    private static final DeviceRgb LIGHT_BG  = new DeviceRgb(241, 245, 249);
    private static final DeviceRgb DARK_TEXT = new DeviceRgb(15, 23, 42);
    private static final DeviceRgb MUTED     = new DeviceRgb(100, 116, 139);

    public byte[] generateInvoicePdf(UUID invoiceId, User currentUser) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        // ownership check
        if (!invoice.getMilestone().getContract().getUser().getId()
                .equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        var milestone = invoice.getMilestone();
        var contract  = milestone.getContract();
        var client    = contract.getClient();
        var user      = contract.getUser();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter   writer   = new PdfWriter(baos);
            PdfDocument pdfDoc   = new PdfDocument(writer);
            Document    document = new Document(pdfDoc);
            document.setMargins(40, 50, 40, 50);

            // ── Header ────────────────────────────────────────
            Table header = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth();

            Cell brandCell = new Cell()
                    .add(new Paragraph("ContractPulse")
                            .setFontSize(22)
                            .setBold()
                            .setFontColor(PRIMARY))
                    .add(new Paragraph("Freelancer Invoice Platform")
                            .setFontSize(9)
                            .setFontColor(MUTED))
                    .setBorder(null);

            Cell invoiceLabel = new Cell()
                    .add(new Paragraph("INVOICE")
                            .setFontSize(28)
                            .setBold()
                            .setFontColor(PRIMARY)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .add(new Paragraph("# " + invoice.getInvoiceNumber())
                            .setFontSize(11)
                            .setFontColor(MUTED)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .setBorder(null);

            header.addCell(brandCell);
            header.addCell(invoiceLabel);
            document.add(header);
            document.add(new LineSeparator(
                    new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(1f))
                    .setMarginTop(8).setMarginBottom(20));

            // ── From / To ─────────────────────────────────────
            Table fromTo = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(24);

            fromTo.addCell(buildInfoCell("FROM", user.getName(), user.getEmail()));
            fromTo.addCell(buildInfoCell("BILL TO", client.getName(),
                    client.getEmail() != null ? client.getEmail() : "—"));
            document.add(fromTo);

            // ── Invoice Details ───────────────────────────────
            Table details = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(24);

            addDetailCell(details, "Issue Date",
                    invoice.getIssuedDate() != null ? invoice.getIssuedDate().format(fmt) : "—");
            addDetailCell(details, "Due Date",
                    invoice.getDueDate() != null ? invoice.getDueDate().format(fmt) : "—");
            addDetailCell(details, "Status", invoice.getStatus().name());
            addDetailCell(details, "Contract", contract.getTitle());
            document.add(details);

            // ── Line Items Table ──────────────────────────────
            Table items = new Table(UnitValue.createPercentArray(new float[]{4, 1, 1, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(16);

            addTableHeader(items, "Description");
            addTableHeader(items, "Milestone");
            addTableHeader(items, "Status");
            addTableHeader(items, "Amount (PKR)");

            items.addCell(buildItemCell(contract.getTitle()
                    + (contract.getDescription() != null
                    ? "\n" + contract.getDescription() : "")));
            items.addCell(buildItemCell(milestone.getTitle()));
            items.addCell(buildItemCell(milestone.getStatus().name()));
            items.addCell(buildItemCell(
                    String.format("%.2f", invoice.getAmount())));

            document.add(items);

            // ── Total ─────────────────────────────────────────
            Table total = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(32);

            total.addCell(new Cell()
                    .add(new Paragraph("TOTAL DUE")
                            .setBold().setFontSize(13).setFontColor(DARK_TEXT)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .setBackgroundColor(LIGHT_BG)
                    .setBorder(null)
                    .setPadding(10));

            total.addCell(new Cell()
                    .add(new Paragraph("PKR " + String.format("%.2f", invoice.getAmount()))
                            .setBold().setFontSize(13).setFontColor(PRIMARY)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .setBackgroundColor(LIGHT_BG)
                    .setBorder(null)
                    .setPadding(10));

            document.add(total);

            // ── Footer ────────────────────────────────────────
            document.add(new LineSeparator(
                    new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(0.5f))
                    .setMarginBottom(8));
            document.add(new Paragraph("Generated by ContractPulse • Thank you for your business!")
                    .setFontSize(9)
                    .setFontColor(MUTED)
                    .setTextAlignment(TextAlignment.CENTER));

            // Close document to flush all content
            document.close();
            
            // Get the byte array before saving to file
            byte[] pdfBytes = baos.toByteArray();
            
            // Save to file system
            String filename = "invoice-" + invoice.getInvoiceNumber() + ".pdf";
            java.nio.file.Path dir = java.nio.file.Paths.get(invoiceDir);
            java.nio.file.Files.createDirectories(dir);
            java.nio.file.Files.write(dir.resolve(filename), pdfBytes);

            // Update pdfPath in DB
            invoice.setPdfPath(invoiceDir + filename);
            invoiceRepository.save(invoice);

            return pdfBytes;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        } finally {
            try {
                baos.close();
            } catch (Exception e) {
                // Log but don't throw
                System.err.println("Error closing ByteArrayOutputStream: " + e.getMessage());
            }
        }
    }

    private Cell buildInfoCell(String label, String name, String email) {
        return new Cell()
                .add(new Paragraph(label)
                        .setFontSize(9).setBold().setFontColor(MUTED))
                .add(new Paragraph(name)
                        .setFontSize(12).setBold().setFontColor(DARK_TEXT))
                .add(new Paragraph(email)
                        .setFontSize(10).setFontColor(MUTED))
                .setBorder(null)
                .setPaddingBottom(8);
    }

    private void addDetailCell(Table table, String label, String value) {
        table.addCell(new Cell()
                .add(new Paragraph(label)
                        .setFontSize(8).setBold().setFontColor(MUTED))
                .add(new Paragraph(value)
                        .setFontSize(10).setFontColor(DARK_TEXT))
                .setBackgroundColor(LIGHT_BG)
                .setBorder(null)
                .setPadding(8));
    }

    private void addTableHeader(Table table, String text) {
        table.addHeaderCell(new Cell()
                .add(new Paragraph(text)
                        .setBold().setFontSize(10)
                        .setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(PRIMARY)
                .setBorder(null)
                .setPadding(8));
    }

    private Cell buildItemCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setFontSize(10).setFontColor(DARK_TEXT))
                .setBackgroundColor(LIGHT_BG)
                .setBorder(null)
                .setPadding(8);
    }
}