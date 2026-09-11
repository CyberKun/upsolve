package dev.upsolve.reviews.dto;
import java.util.List;
public record ReviewDueResponse(
    List<ReviewItemResponse> overdue,
    List<ReviewItemResponse> today,
    List<ReviewItemResponse> upcoming
) {}