package CampusConnect.Application.connect.service;

import CampusConnect.Application.connect.dto.EventRequestDTO;
import CampusConnect.Application.connect.dto.EventResponseDTO;
import CampusConnect.Application.connect.entity.Event;
import CampusConnect.Application.connect.entity.User;
import CampusConnect.Application.connect.repository.EventRepository;
import CampusConnect.Application.connect.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    private EventResponseDTO mapToResponseDTO(Event event) {
        EventResponseDTO dto = new EventResponseDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setDate(event.getDate());
        dto.setLocation(event.getLocation());

        dto.setCreatedById(event.getCreatedBy().getId());
        dto.setCreatedByName(event.getCreatedBy().getName());

        return dto;
    }

    // ✅ FIXED METHOD
    public EventResponseDTO saveEventFromDTO(EventRequestDTO eventDTO, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = new Event();
        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setDate(eventDTO.getDate());
        event.setLocation(eventDTO.getLocation());

        // 🔥 IMPORTANT CHANGE
        event.setCreatedBy(user);

        Event savedEvent = eventRepository.save(event);

        return mapToResponseDTO(savedEvent);
    }

    public Page<EventResponseDTO> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable)
                .map(this::mapToResponseDTO);
    }

    public List<EventResponseDTO> getEventsByStudentId(Long studentId) {
        return eventRepository.findByParticipants_Id(studentId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }
}