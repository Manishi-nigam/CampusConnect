package CampusConnect.Application.connect.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "google_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String googleId;

    private String name;

    @Column(unique = true)
    private String email;

    private String pictureUrl;


}
