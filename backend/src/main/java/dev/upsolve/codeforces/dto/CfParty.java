package dev.upsolve.codeforces.dto;
import java.util.List;

public record CfParty(Integer contestId, List<CfMember> members, String participantType, Boolean ghost) {}
