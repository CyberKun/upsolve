package dev.upsolve.auth;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import dev.upsolve.common.EntityNotFoundException;
import java.util.UUID;

public class AuthUtils {

    private AuthUtils() {}

    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new dev.upsolve.common.EntityNotFoundException("User not authenticated");
        }
        
        if (authentication.getPrincipal() instanceof UUID) {
            return (UUID) authentication.getPrincipal();
        } else if (authentication.getPrincipal() instanceof String) {
            return UUID.fromString((String) authentication.getPrincipal());
        }
        
        throw new IllegalStateException("Authentication principal is not a UUID: " + authentication.getPrincipal().getClass());
    }

    public static UUID getCurrentUserIdSafe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }
        
        if (authentication.getPrincipal() instanceof UUID) {
            return (UUID) authentication.getPrincipal();
        } else if (authentication.getPrincipal() instanceof String) {
            try {
                return UUID.fromString((String) authentication.getPrincipal());
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
        return null;
    }
}
