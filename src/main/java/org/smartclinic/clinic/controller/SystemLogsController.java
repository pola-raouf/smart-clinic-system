package org.smartclinic.clinic.controller;

import org.smartclinic.clinic.Dto.SystemLogEntryDTO;
import org.smartclinic.clinic.util.ClinicLogger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/owner/logs")
public class SystemLogsController {

    private final ClinicLogger logger = ClinicLogger.getInstance();

    @GetMapping
    public ResponseEntity<List<SystemLogEntryDTO>> getLogs(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String role) {

        Path logPath = logger.getLogPath();
        if (!Files.exists(logPath)) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<SystemLogEntryDTO> entries = new ArrayList<>();
        try (Stream<String> lines = Files.lines(logPath)) {
            entries = lines.map(this::parseLine)
                    .filter(e -> e != null)
                    .filter(e -> level == null || level.isBlank() || e.getLevel().equalsIgnoreCase(level))
                    .filter(e -> module == null || module.isBlank() || "ALL".equalsIgnoreCase(module) || e.getModule().equalsIgnoreCase(module))
                    .filter(e -> role == null || role.isBlank() || "ALL".equalsIgnoreCase(role) || e.getRole().equalsIgnoreCase(role))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
        }

        Collections.reverse(entries); // newest first
        return ResponseEntity.ok(entries);
    }

    private SystemLogEntryDTO parseLine(String line) {
        if (line == null || line.trim().isEmpty()) return null;

        // Structured pipe format
        String[] parts = line.split("\\|", 9);
        if (parts.length == 9) {
            return SystemLogEntryDTO.builder()
                    .timestamp(parts[0].trim())
                    .level(parts[1].trim())
                    .eventType(parts[2].trim())
                    .user(parts[3].trim())
                    .role(parts[4].trim())
                    .action(parts[5].trim())
                    .module(parts[6].trim())
                    .status(parts[7].trim())
                    .message(parts[8].trim())
                    .build();
        }

        // Legacy format fallback: [2026-05-12 10:24:06] [INFO ] message
        if (line.startsWith("[")) {
            int timeEnd = line.indexOf(']');
            if (timeEnd > 1) {
                String ts = line.substring(1, timeEnd);
                int lvlStart = line.indexOf('[', timeEnd);
                int lvlEnd = line.indexOf(']', lvlStart);
                if (lvlStart > 0 && lvlEnd > lvlStart) {
                    String lvl = line.substring(lvlStart + 1, lvlEnd).trim();
                    String msg = line.substring(lvlEnd + 1).trim();
                    return SystemLogEntryDTO.builder()
                            .timestamp(ts)
                            .level(lvl)
                            .eventType("SYSTEM_EVENT")
                            .user("SYSTEM")
                            .role("N/A")
                            .action("LOG")
                            .module("CORE")
                            .status("SUCCESS")
                            .message(msg)
                            .build();
                }
            }
        }

        // Unrecognized format
        return SystemLogEntryDTO.builder()
                .timestamp("")
                .level("INFO")
                .eventType("UNKNOWN")
                .user("N/A")
                .role("N/A")
                .action("N/A")
                .module("N/A")
                .status("N/A")
                .message(line)
                .build();
    }
}
