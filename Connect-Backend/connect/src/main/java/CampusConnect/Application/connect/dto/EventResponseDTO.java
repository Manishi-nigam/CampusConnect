package CampusConnect.Application.connect.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class EventResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate date;
    private String location;

    private Long createdById;
    private String createdByName;
}
