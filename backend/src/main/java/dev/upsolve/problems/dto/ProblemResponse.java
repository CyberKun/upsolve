package dev.upsolve.problems.dto;

import java.util.List;

public record ProblemResponse(
        Long id,
        Integer contestId,
        String problemIndex,
        String name,
        Integer rating,
        List<String> tags,
        String problemType
) {}
