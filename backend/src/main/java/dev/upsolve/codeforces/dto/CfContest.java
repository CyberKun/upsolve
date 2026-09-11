package dev.upsolve.codeforces.dto;

public record CfContest(Integer id, String name, Long startTimeSeconds, Long durationSeconds, String phase) {}
