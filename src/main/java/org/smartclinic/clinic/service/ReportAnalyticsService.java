package org.smartclinic.clinic.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.smartclinic.clinic.Dto.ReportAnalyticsDTO;
import org.smartclinic.clinic.Dto.ReportTableRowDTO;
import org.smartclinic.clinic.Dto.TrendPointDTO;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.Repository.AppointmentRepository;
import org.smartclinic.clinic.Repository.DoctorRepository;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.util.ClinicLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;

@Service
public class ReportAnalyticsService {

    private final ClinicLogger logger = ClinicLogger.getInstance();

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Value("${app.clinic.name:Smart Clinic}")
    private String clinicName;

    public ReportAnalyticsDTO getKpis(LocalDate from, LocalDate to, Long doctorId) {
        logger.info("Report KPIs requested: from=" + from + " to=" + to + " doctorId=" + doctorId);
        long total = appointmentRepository.countByDateRangeAndDoctor(from, to, doctorId);
        long completed = appointmentRepository.countByStatusAndDateRangeAndDoctor(AppointmentStatus.COMPLETED, from, to, doctorId);
        long cancelled = appointmentRepository.countByStatusAndDateRangeAndDoctor(AppointmentStatus.CANCELLED, from, to, doctorId);
        long pending = appointmentRepository.countByStatusAndDateRangeAndDoctor(AppointmentStatus.PENDING, from, to, doctorId);
        long booked = appointmentRepository.countByStatusAndDateRangeAndDoctor(AppointmentStatus.BOOKED, from, to, doctorId);
        long noShow = Math.max(0, total - completed - cancelled - pending - booked);

        double completionRate = total == 0 ? 0.0 : round1((double) completed / total * 100);
        double cancellationRate = total == 0 ? 0.0 : round1((double) cancelled / total * 100);
        double noShowRate = total == 0 ? 0.0 : round1((double) noShow / total * 100);

        return ReportAnalyticsDTO.builder()
                .totalAppointments(total)
                .completed(completed)
                .cancelled(cancelled)
                .noShow(noShow)
                .completionRate(completionRate)
                .cancellationRate(cancellationRate)
                .noShowRate(noShowRate)
                .build();
    }

    public List<TrendPointDTO> getAppointmentTrend(LocalDate from, LocalDate to, Long doctorId) {
        logger.info("Report appointment trend requested");
        List<Object[]> rows = appointmentRepository.countGroupedByDateFiltered(from, to, doctorId);
        Map<LocalDate, Long> map = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            map.put(d, 0L);
        }
        for (Object[] row : rows) {
            LocalDate date = (LocalDate) row[0];
            long cnt = ((Number) row[1]).longValue();
            map.put(date, cnt);
        }
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");
        List<TrendPointDTO> result = new ArrayList<>();
        for (Map.Entry<LocalDate, Long> e : map.entrySet()) {
            result.add(new TrendPointDTO(e.getKey().format(fmt), e.getValue()));
        }
        return result;
    }

    public List<TrendPointDTO> getPatientGrowth() {
        logger.info("Report patient growth requested");
        long total = patientRepository.count();
        if (total == 0) {
            return Collections.emptyList();
        }
        long perMonth = Math.max(1, total / 12);
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        LocalDate today = LocalDate.now();
        List<TrendPointDTO> result = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate month = today.minusMonths(i).withDayOfMonth(1);
            long startId = Math.max(1, total - (i + 1) * perMonth) + 1;
            long endId = total - i * perMonth;
            long cnt = patientRepository.countApproxInRange(startId, endId);
            result.add(new TrendPointDTO(months[month.getMonthValue() - 1] + " " + month.getYear(), cnt));
        }
        return result;
    }

    public List<ReportTableRowDTO> getTableRows(LocalDate from, LocalDate to, Long doctorId) {
        logger.info("Report table rows requested");
        List<Object[]> rows = appointmentRepository.countByDateAndStatusGrouped(from, to, doctorId);

        Map<LocalDate, long[]> dayMap = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            dayMap.put(d, new long[]{0, 0, 0});
        }

        for (Object[] row : rows) {
            LocalDate date = (LocalDate) row[0];
            AppointmentStatus status = (AppointmentStatus) row[1];
            long cnt = ((Number) row[2]).longValue();
            long[] arr = dayMap.computeIfAbsent(date, k -> new long[]{0, 0, 0});
            if (status == AppointmentStatus.COMPLETED) arr[0] += cnt;
            else if (status == AppointmentStatus.CANCELLED) arr[1] += cnt;
            else arr[2] += cnt;
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d, yyyy");
        List<ReportTableRowDTO> result = new ArrayList<>();
        for (Map.Entry<LocalDate, long[]> e : dayMap.entrySet()) {
            long[] arr = e.getValue();
            long completed = arr[0];
            long cancelled = arr[1];
            long other = arr[2];
            long total = completed + cancelled + other;
            long noShow = Math.max(0, total - completed - cancelled);
            String rate = total == 0 ? "0.0%" : round1((double) completed / total * 100) + "%";
            result.add(new ReportTableRowDTO(
                    e.getKey().format(fmt), total, completed, cancelled, noShow, rate
            ));
        }
        return result;
    }

    public byte[] exportPdf(LocalDate from, LocalDate to, Long doctorId, String requestedBy) {
        logger.info("Report PDF export by=" + requestedBy + " from=" + from + " to=" + to);
        ReportAnalyticsDTO kpi = getKpis(from, to, doctorId);
        List<ReportTableRowDTO> table = getTableRows(from, to, doctorId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 48, 48, 48, 48);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            com.lowagie.text.Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph title = new Paragraph(clinicName + " — Analytics Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d, yyyy");
            doc.add(new Paragraph("Period: " + from.format(fmt) + " to " + to.format(fmt), bodyFont));
            doc.add(new Paragraph("Generated: " + LocalDate.now().format(fmt), bodyFont));
            doc.add(new Paragraph(" "));

            doc.add(new Paragraph("Summary", headerFont));
            doc.add(new Paragraph("Total Appointments: " + kpi.getTotalAppointments(), bodyFont));
            doc.add(new Paragraph("Completed: " + kpi.getCompleted() + " (" + kpi.getCompletionRate() + "%)", bodyFont));
            doc.add(new Paragraph("Cancelled: " + kpi.getCancelled() + " (" + kpi.getCancellationRate() + "%)", bodyFont));
            doc.add(new Paragraph("No-show: " + kpi.getNoShow() + " (" + kpi.getNoShowRate() + "%)", bodyFont));
            doc.add(new Paragraph(" "));

            doc.add(new Paragraph("Detailed Report", headerFont));
            doc.add(new Paragraph(" "));

            PdfPTable tbl = new PdfPTable(new float[]{2.5f, 1f, 1f, 1f, 1f, 1.5f});
            tbl.setWidthPercentage(100);
            for (String h : new String[]{"Date","Total","Completed","Cancelled","No-show","Rate"}) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new java.awt.Color(219, 234, 254));
                cell.setPadding(6);
                tbl.addCell(cell);
            }
            for (ReportTableRowDTO row : table) {
                tbl.addCell(new Phrase(row.getDate(), bodyFont));
                tbl.addCell(new Phrase(String.valueOf(row.getTotal()), bodyFont));
                tbl.addCell(new Phrase(String.valueOf(row.getCompleted()), bodyFont));
                tbl.addCell(new Phrase(String.valueOf(row.getCancelled()), bodyFont));
                tbl.addCell(new Phrase(String.valueOf(row.getNoShow()), bodyFont));
                tbl.addCell(new Phrase(row.getCompletionRate(), bodyFont));
            }
            doc.add(tbl);
            doc.close();
            return baos.toByteArray();
        } catch (DocumentException | IOException e) {
            logger.error("PDF export failed: " + e.getMessage());
            throw new org.smartclinic.clinic.exception.ApiException("Could not generate PDF report.");
        }
    }

    public byte[] exportCsv(LocalDate from, LocalDate to, Long doctorId, String requestedBy) {
        logger.info("Report CSV export by=" + requestedBy + " from=" + from + " to=" + to);
        ReportAnalyticsDTO kpi = getKpis(from, to, doctorId);
        List<ReportTableRowDTO> table = getTableRows(from, to, doctorId);

        StringBuilder sb = new StringBuilder();
        sb.append("Smart Clinic Report\n");
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d yyyy");
        sb.append("Period,").append(from.format(fmt)).append(" to ").append(to.format(fmt)).append("\n\n");
        sb.append("Summary\n");
        sb.append("Total Appointments,").append(kpi.getTotalAppointments()).append("\n");
        sb.append("Completed,").append(kpi.getCompleted()).append(",").append(kpi.getCompletionRate()).append("%\n");
        sb.append("Cancelled,").append(kpi.getCancelled()).append(",").append(kpi.getCancellationRate()).append("%\n");
        sb.append("No-show,").append(kpi.getNoShow()).append(",").append(kpi.getNoShowRate()).append("%\n\n");
        sb.append("Date,Total,Completed,Cancelled,No-show,Completion Rate\n");
        for (ReportTableRowDTO row : table) {
            sb.append(row.getDate()).append(",")
              .append(row.getTotal()).append(",")
              .append(row.getCompleted()).append(",")
              .append(row.getCancelled()).append(",")
              .append(row.getNoShow()).append(",")
              .append(row.getCompletionRate()).append("\n");
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private double round1(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}
