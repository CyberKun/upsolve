package dev.upsolve.export;

import dev.upsolve.auth.AuthUtils;
import dev.upsolve.export.dto.ExportData;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/export")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping
    public ResponseEntity<ExportData> export() {
        ExportData data = exportService.exportUserData(AuthUtils.getCurrentUserId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"upsolve-export.json\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }
}
