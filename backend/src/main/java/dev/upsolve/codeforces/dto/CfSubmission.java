package dev.upsolve.codeforces.dto;

public record CfSubmission(Long id, Integer contestId, Long creationTimeSeconds, CfProblem problem, CfParty author, String programmingLanguage, String verdict, Integer passedTestCount, Long timeConsumedMillis, Long memoryConsumedBytes) {}
