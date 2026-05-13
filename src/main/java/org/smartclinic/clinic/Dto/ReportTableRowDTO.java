package org.smartclinic.clinic.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReportTableRowDTO {
    private String date;
    private long total;
    private long completed;
    private long cancelled;
    private long noShow;
    private String completionRate;
}
