package dev.upsolve.codeforces;

import dev.upsolve.codeforces.dto.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.ResourceAccessException;

import java.util.List;
import java.util.Objects;

@Component
public class CodeforcesClient {

    private final RestClient restClient;
    private final CodeforcesRateLimiter rateLimiter;

    public CodeforcesClient(RestClient codeforcesRestClient, CodeforcesRateLimiter rateLimiter) {
        this.restClient = codeforcesRestClient;
        this.rateLimiter = rateLimiter;
    }

    public CfUser validateHandle(String handle) {
        rateLimiter.acquire();
        try {
            CfResponse<List<CfUser>> response = restClient.get()
                    .uri("/user.info?handles={handle}", handle)
                    .retrieve()
                    .onStatus(status -> status.value() == 400, (request, res) -> {
                        // CF returns 400 for handle not found
                        throw new CodeforcesHandleNotFoundException("Handle not found: " + handle);
                    })
                    .onStatus(status -> status.value() == 429, (request, res) -> {
                        throw new CodeforcesRateLimitException("Rate limit exceeded");
                    })
                    .body(new ParameterizedTypeReference<CfResponse<List<CfUser>>>() {});

            if (response == null || !response.isOk() || response.result() == null || response.result().isEmpty()) {
                throw new CodeforcesApiException("Failed to fetch user info: " + (response != null ? response.comment() : "null"));
            }
            return response.result().get(0);
        } catch (ResourceAccessException e) {
            throw new CodeforcesTimeoutException("Timeout while fetching user info", e);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 429) {
                throw new CodeforcesRateLimitException("Rate limit exceeded");
            }
            throw new CodeforcesApiException("HTTP Error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        }
    }

    public List<CfSubmission> getUserSubmissions(String handle, int from, int count) {
        rateLimiter.acquire();
        try {
            CfResponse<List<CfSubmission>> response = restClient.get()
                    .uri("/user.status?handle={handle}&from={from}&count={count}", handle, from, count)
                    .retrieve()
                    .onStatus(status -> status.value() == 429, (request, res) -> {
                        throw new CodeforcesRateLimitException("Rate limit exceeded");
                    })
                    .body(new ParameterizedTypeReference<CfResponse<List<CfSubmission>>>() {});

            if (response == null || !response.isOk() || response.result() == null) {
                throw new CodeforcesApiException("Failed to fetch user submissions: " + (response != null ? response.comment() : "null"));
            }
            return response.result();
        } catch (ResourceAccessException e) {
            throw new CodeforcesTimeoutException("Timeout while fetching user submissions", e);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 429) {
                throw new CodeforcesRateLimitException("Rate limit exceeded");
            }
            throw new CodeforcesApiException("HTTP Error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        }
    }

    public CfProblemSet getProblems() {
        rateLimiter.acquire();
        try {
            CfResponse<CfProblemSet> response = restClient.get()
                    .uri("/problemset.problems")
                    .retrieve()
                    .onStatus(status -> status.value() == 429, (request, res) -> {
                        throw new CodeforcesRateLimitException("Rate limit exceeded");
                    })
                    .body(new ParameterizedTypeReference<CfResponse<CfProblemSet>>() {});

            if (response == null || !response.isOk() || response.result() == null) {
                throw new CodeforcesApiException("Failed to fetch problems: " + (response != null ? response.comment() : "null"));
            }
            return response.result();
        } catch (ResourceAccessException e) {
            throw new CodeforcesTimeoutException("Timeout while fetching problems", e);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 429) {
                throw new CodeforcesRateLimitException("Rate limit exceeded");
            }
            throw new CodeforcesApiException("HTTP Error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        }
    }

    public List<CfContest> getContests() {
        rateLimiter.acquire();
        try {
            CfResponse<List<CfContest>> response = restClient.get()
                    .uri("/contest.list?gym=false")
                    .retrieve()
                    .onStatus(status -> status.value() == 429, (request, res) -> {
                        throw new CodeforcesRateLimitException("Rate limit exceeded");
                    })
                    .body(new ParameterizedTypeReference<CfResponse<List<CfContest>>>() {});

            if (response == null || !response.isOk() || response.result() == null) {
                throw new CodeforcesApiException("Failed to fetch contests: " + (response != null ? response.comment() : "null"));
            }
            return response.result();
        } catch (ResourceAccessException e) {
            throw new CodeforcesTimeoutException("Timeout while fetching contests", e);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 429) {
                throw new CodeforcesRateLimitException("Rate limit exceeded");
            }
            throw new CodeforcesApiException("HTTP Error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        }
    }
}
