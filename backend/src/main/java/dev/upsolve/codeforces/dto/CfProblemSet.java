package dev.upsolve.codeforces.dto;
import java.util.List;

public record CfProblemSet(List<CfProblem> problems, List<CfProblemStatistics> problemStatistics) {}
