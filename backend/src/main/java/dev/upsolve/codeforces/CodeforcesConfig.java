package dev.upsolve.codeforces;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import java.time.Duration;

@Configuration
@org.springframework.boot.context.properties.EnableConfigurationProperties(CodeforcesConfig.CodeforcesProperties.class)
public class CodeforcesConfig {


    @Bean
    public RestClient codeforcesRestClient(CodeforcesProperties properties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(properties.timeoutSeconds()));
        factory.setReadTimeout(Duration.ofSeconds(properties.timeoutSeconds()));
        return RestClient.builder()
                .baseUrl(properties.baseUrl())
                .requestFactory(factory)
                .build();
    }

    @ConfigurationProperties(prefix = "codeforces.api")
    public record CodeforcesProperties(
            String baseUrl,
            int rateLimitMs,
            int timeoutSeconds,
            int pageSize,
            int catalogTtlHours
    ) {

    }
}
