package dev.upsolve.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, UUID> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM UserPreferences p WHERE p.userId = :id")
    java.util.Optional<UserPreferences> findLockedById(UUID id);
}
