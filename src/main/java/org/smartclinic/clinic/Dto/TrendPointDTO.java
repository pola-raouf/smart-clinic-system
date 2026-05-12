package org.smartclinic.clinic.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TrendPointDTO {
    private String label;
    private long count;
}
