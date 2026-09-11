package dev.upsolve.notes;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProblemNoteRepository extends JpaRepository<ProblemNote, UUID> {
}
