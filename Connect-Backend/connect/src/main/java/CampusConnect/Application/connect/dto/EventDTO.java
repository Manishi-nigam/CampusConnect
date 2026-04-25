package CampusConnect.Application.connect.dto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EventDTO {
    private String title;
    private String description;
    private LocalDate date;
    private String location;
    private Long studentId;
}
