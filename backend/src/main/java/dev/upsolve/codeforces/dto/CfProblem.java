package dev.upsolve.codeforces.dto;
import java.util.List;

public record CfProblem(Integer contestId, String index, String name, Integer rating, List<String> tags, String type) {}
