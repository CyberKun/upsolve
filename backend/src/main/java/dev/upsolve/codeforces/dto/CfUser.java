package dev.upsolve.codeforces.dto;

public record CfUser(String handle, Integer rating, Integer maxRating, String rank, String maxRank, String avatar, Long registrationTimeSeconds) {}
