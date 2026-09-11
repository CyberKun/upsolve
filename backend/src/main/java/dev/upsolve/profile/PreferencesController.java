package dev.upsolve.profile;

import dev.upsolve.auth.AuthUtils;
import dev.upsolve.profile.dto.PreferencesResponse;
import dev.upsolve.profile.dto.TrackedHandleRequest;
import dev.upsolve.profile.dto.UpdatePreferencesRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class PreferencesController {

    private final PreferencesService preferencesService;

    public PreferencesController(PreferencesService preferencesService) {
        this.preferencesService = preferencesService;
    }

    @GetMapping("/preferences")
    public PreferencesResponse getPreferences() {
        return preferencesService.getPreferences(AuthUtils.getCurrentUserId());
    }

    @PatchMapping("/preferences")
    public PreferencesResponse updatePreferences(@Valid @RequestBody UpdatePreferencesRequest request) {
        return preferencesService.updatePreferences(AuthUtils.getCurrentUserId(), request);
    }

    @PostMapping("/tracked-handle")
    public PreferencesResponse setTrackedHandle(@Valid @RequestBody TrackedHandleRequest request) {
        return preferencesService.setTrackedHandle(AuthUtils.getCurrentUserId(), request);
    }
}
