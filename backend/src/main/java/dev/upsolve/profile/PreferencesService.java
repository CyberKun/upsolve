package dev.upsolve.profile;

import dev.upsolve.codeforces.CodeforcesClient;
import dev.upsolve.codeforces.dto.CfUser;
import dev.upsolve.common.ConflictException;
import dev.upsolve.common.EntityNotFoundException;
import dev.upsolve.profile.dto.PreferencesResponse;
import dev.upsolve.profile.dto.TrackedHandleRequest;
import dev.upsolve.profile.dto.UpdatePreferencesRequest;
import dev.upsolve.sync.SyncService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
public class PreferencesService {

    private final UserPreferencesRepository preferencesRepository;
    private final CodeforcesClient codeforcesClient;
    private final SyncService syncService;

    public PreferencesService(UserPreferencesRepository preferencesRepository,
                              CodeforcesClient codeforcesClient,
                              SyncService syncService) {
        this.preferencesRepository = preferencesRepository;
        this.codeforcesClient = codeforcesClient;
        this.syncService = syncService;
    }

    @Transactional(readOnly = true)
    public PreferencesResponse getPreferences(UUID userId) {
        UserPreferences prefs = preferencesRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Preferences not found for user"));
        return mapToResponse(prefs);
    }

    @Transactional
    public PreferencesResponse updatePreferences(UUID userId, UpdatePreferencesRequest req) {
        UserPreferences prefs = preferencesRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Preferences not found for user"));

        int min = req.targetRatingMin() == null ? prefs.getTargetRatingMin() : req.targetRatingMin();
        int max = req.targetRatingMax() == null ? prefs.getTargetRatingMax() : req.targetRatingMax();
        if (min > max) throw new IllegalArgumentException("Minimum rating cannot exceed maximum rating");
        if (req.timeZone() != null) {
            try { java.time.ZoneId.of(req.timeZone()); }
            catch (java.time.DateTimeException ex) { throw new IllegalArgumentException("Invalid time zone"); }
        }
        if (req.reviewIntervals() != null) {
            var intervals = req.reviewIntervals();
            for (int i = 1; i < intervals.size(); i++) {
                if (intervals.get(i) <= intervals.get(i - 1)) throw new IllegalArgumentException("Review intervals must be strictly increasing");
            }
        }
        if (req.targetRatingMin() != null) {
            prefs.setTargetRatingMin(req.targetRatingMin());
        }
        if (req.targetRatingMax() != null) {
            prefs.setTargetRatingMax(req.targetRatingMax());
        }
        if (req.preferredTopics() != null) {
            prefs.setPreferredTopics(req.preferredTopics());
        }
        if (req.timeZone() != null) {
            prefs.setTimeZone(req.timeZone());
        }
        if (req.reviewIntervals() != null) {
            prefs.setReviewIntervals(req.reviewIntervals());
        }

        prefs = preferencesRepository.save(prefs);
        return mapToResponse(prefs);
    }

    @Transactional
    public PreferencesResponse setTrackedHandle(UUID userId, TrackedHandleRequest req) {
        UserPreferences prefs = preferencesRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Preferences not found for user"));

        if (prefs.getTrackedHandle() != null && !prefs.getTrackedHandle().isEmpty()) {
            throw new ConflictException("Tracked handle is already set and cannot be changed");
        }

        String handle = req.handle().trim();
        String handleNormalized = handle.toLowerCase(Locale.ROOT);

        // Validate handle via Codeforces API
        CfUser cfUser = codeforcesClient.validateHandle(handle);

        prefs.setTrackedHandle(cfUser.handle()); // use correct casing from API
        prefs.setHandleNormalized(cfUser.handle().toLowerCase(Locale.ROOT));

        prefs = preferencesRepository.save(prefs);
        
        // Trigger initial sync job
        syncService.triggerSync(userId);

        return mapToResponse(prefs);
    }

    private PreferencesResponse mapToResponse(UserPreferences prefs) {
        boolean setupComplete = prefs.getTrackedHandle() != null && !prefs.getTrackedHandle().isEmpty();
        return new PreferencesResponse(
            prefs.getUserId(),
            prefs.getTrackedHandle(),
            prefs.getTimeZone(),
            prefs.getTargetRatingMin(),
            prefs.getTargetRatingMax(),
            prefs.getPreferredTopics(),
            prefs.getReviewIntervals(),
            setupComplete
        );
    }
}
