package CampusConnect.Application.connect.repository;

import CampusConnect.Application.connect.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventRepository extends JpaRepository<Event,Long> {
    List<Event> findByCreatedBy_Id(Long userId);
    Page<Event> findAll(Pageable pageable);
    List<Event> findByParticipants_Id(Long studentId);
}
