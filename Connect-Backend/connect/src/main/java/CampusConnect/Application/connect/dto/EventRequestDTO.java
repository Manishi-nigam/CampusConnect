package CampusConnect.Application.connect.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EventRequestDTO {
    private String title;
    private String description;
    private LocalDate date;
    private String location;
}
