package dev.upsolve.reviews.dto;
import java.time.LocalDate;
import java.util.UUID;
// Using a generic record for problem since we don't have the ProblemResponse imported here easily.
public record ReviewItemResponse(
    UUID queueItemId, 
    Object problem, 
    String status, 
    LocalDate nextReviewDate, 
    int intervalIndex, 
    int totalReviews
) {}