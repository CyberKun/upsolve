package dev.upsolve.sync;

import dev.upsolve.sync.dto.SyncJobResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sync-jobs")
public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping
    public ResponseEntity<SyncJobResponse> triggerSync() {
        SyncJobResponse response = syncService.triggerSync(dev.upsolve.auth.AuthUtils.getCurrentUserId());
        return ResponseEntity.accepted().body(response);
    }

    @GetMapping
    public ResponseEntity<List<SyncJobResponse>> getJobs() {
        return ResponseEntity.ok(syncService.getJobs(dev.upsolve.auth.AuthUtils.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SyncJobResponse> getJob(@PathVariable UUID id) {
        return ResponseEntity.ok(syncService.getJob(dev.upsolve.auth.AuthUtils.getCurrentUserId(), id));
    }
}
