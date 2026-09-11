package dev.upsolve.codeforces.dto;

public record CfResponse<T>(String status, T result, String comment) {
    public boolean isOk() { return "OK".equals(status); }
}
