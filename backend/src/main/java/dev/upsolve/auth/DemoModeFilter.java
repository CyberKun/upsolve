package dev.upsolve.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

public class DemoModeFilter extends OncePerRequestFilter {

    private static final UUID DEMO_USER_ID = UUID.fromString("a0000000-0000-0000-0000-000000000001");
    private final ObjectMapper objectMapper;

    public DemoModeFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String method = request.getMethod();
        String uri = request.getRequestURI();

        // If it's a modifying request and it's not auth login/logout
        if (HttpMethod.POST.matches(method) || HttpMethod.PUT.matches(method) || 
            HttpMethod.PATCH.matches(method) || HttpMethod.DELETE.matches(method)) {
            
            if (!uri.equals("/api/v1/auth/login") && !uri.equals("/api/v1/auth/logout") && !uri.equals("/api/v1/auth/register")) {
                UUID userId = AuthUtils.getCurrentUserIdSafe();
                if (DEMO_USER_ID.equals(userId)) {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType("application/problem+json");
                    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Action not allowed in demo mode.");
                    problem.setTitle("Demo Mode Restricted");
                    response.getWriter().write(objectMapper.writeValueAsString(problem));
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
