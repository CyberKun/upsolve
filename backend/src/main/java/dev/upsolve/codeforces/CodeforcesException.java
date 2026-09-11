package dev.upsolve.codeforces;

public class CodeforcesException extends RuntimeException {
    public CodeforcesException(String message) { super(message); }
    public CodeforcesException(String message, Throwable cause) { super(message, cause); }
}
