package CampusConnect.Application.connect.repository;

import CampusConnect.Application.connect.entity.JoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    Optional<JoinRequest> findByEventIdAndUserId(Long eventId, Long userId);
    List<JoinRequest> findByEventId(Long eventId);
}
