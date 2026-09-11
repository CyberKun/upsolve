package dev.upsolve.codeforces;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.Duration;

@Component
public class CodeforcesRateLimiter {

    private final CodeforcesConfig.CodeforcesProperties properties;
    private Instant lastRequestTime = Instant.MIN;

    public CodeforcesRateLimiter(CodeforcesConfig.CodeforcesProperties properties) {
        this.properties = properties;
    }

    public synchronized void acquire() {
        Instant now = Instant.now();
        Instant nextAllowedTime = lastRequestTime.plusMillis(properties.rateLimitMs());
        if (now.isBefore(nextAllowedTime)) {
            try {
                Thread.sleep(Duration.between(now, nextAllowedTime).toMillis());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new CodeforcesException("Rate limiter interrupted", e);
            }
        }
        lastRequestTime = Instant.now();
    }
}
