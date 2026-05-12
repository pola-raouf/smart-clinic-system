package org.smartclinic.clinic.util;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.locks.ReentrantLock;

public final class ClinicLogger {

    private static volatile ClinicLogger instance;
    private static final ReentrantLock initLock = new ReentrantLock();
    private final ReentrantLock writeLock = new ReentrantLock();

    private static final DateTimeFormatter TIMESTAMP_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final String LOG_DIR  = "logs";
    private static final String LOG_FILE = "clinic-system.log";

    private final Path logPath;

    private ClinicLogger() {
        Path dir = Paths.get(LOG_DIR);
        try {
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }
        } catch (IOException ignored) {
        }
        logPath = dir.resolve(LOG_FILE);
    }

    public static ClinicLogger getInstance() {
        if (instance == null) {
            initLock.lock();
            try {
                if (instance == null) {
                    instance = new ClinicLogger();
                }
            } finally {
                initLock.unlock();
            }
        }
        return instance;
    }

    public void info(String message) {
        logEvent("INFO", "SYSTEM_EVENT", "SYSTEM", "N/A", "LOG", "CORE", "SUCCESS", message);
    }

    public void warn(String message) {
        logEvent("WARN", "SYSTEM_WARNING", "SYSTEM", "N/A", "LOG", "CORE", "WARNING", message);
    }

    public void error(String message) {
        logEvent("ERROR", "SYSTEM_ERROR", "SYSTEM", "N/A", "LOG", "CORE", "FAILURE", message);
    }

    public void logEvent(String level, String eventType, String user, String role, String action, String module, String status, String message) {
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FMT);
        // Format: TIMESTAMP | LEVEL | EVENT_TYPE | USER | ROLE | ACTION | MODULE | STATUS | MESSAGE
        String line = String.format("%s | %-5s | %s | %s | %s | %s | %s | %s | %s",
                timestamp, level, eventType, user, role, action, module, status, message);
        
        writeLock.lock();
        try (PrintWriter pw = new PrintWriter(new FileWriter(logPath.toFile(), true))) {
            pw.println(line);
        } catch (IOException ignored) {
        } finally {
            writeLock.unlock();
        }
    }
    
    public Path getLogPath() {
        return logPath;
    }
}
