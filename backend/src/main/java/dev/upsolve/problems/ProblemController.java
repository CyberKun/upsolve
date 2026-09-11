package dev.upsolve.problems;

import dev.upsolve.problems.dto.ProblemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping
    public ResponseEntity<dev.upsolve.common.PageResponse<ProblemResponse>> searchProblems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating,
            @RequestParam(required = false) List<String> tags,
            Pageable pageable
    ) {
        return ResponseEntity.ok(dev.upsolve.common.PageResponse.of(problemService.searchProblems(search, minRating, maxRating, tags, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemResponse> getProblem(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblem(id));
    }
}
