package dev.upsolve.auth;

import dev.upsolve.auth.dto.RegisterRequest;
import dev.upsolve.auth.dto.UserResponse;
import dev.upsolve.common.ConflictException;
import dev.upsolve.common.EntityNotFoundException;
import dev.upsolve.profile.UserPreferences;
import dev.upsolve.profile.UserPreferencesRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AppUserRepository userRepository, 
                       UserPreferencesRepository preferencesRepository, 
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.preferencesRepository = preferencesRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest req) {
        String usernameNorm = req.username().toLowerCase(Locale.ROOT).trim();
        if (usernameNorm.length() < 3) throw new IllegalArgumentException("Username must be at least 3 characters");
        if (req.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) throw new IllegalArgumentException("Password must be at most 72 UTF-8 bytes");
        
        if (userRepository.existsByUsernameNorm(usernameNorm)) {
            throw new ConflictException("Username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(req.username().trim());
        user.setUsernameNorm(usernameNorm);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        
        user = userRepository.save(user);

        UserPreferences prefs = new UserPreferences();
        prefs.setUserId(user.getId());
        preferencesRepository.save(prefs);

        return new UserResponse(
            user.getId(), 
            user.getUsername(), 
            user.getCreatedAt(), 
            false, 
            false
        );
    }

    @Transactional(readOnly = true)
    public AppUser authenticate(String username, String password) {
        String usernameNorm = username.toLowerCase(Locale.ROOT).trim();
        
        AppUser user = userRepository.findByUsernameNorm(usernameNorm)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
                
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        
        return user;
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
                
        UserPreferences prefs = preferencesRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User preferences not found"));
                
        boolean hasTrackedHandle = prefs.getTrackedHandle() != null && !prefs.getTrackedHandle().isEmpty();
        boolean setupComplete = hasTrackedHandle; 
        
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getCreatedAt(),
            hasTrackedHandle,
            setupComplete
        );
    }
}
