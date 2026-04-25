package CampusConnect.Application.connect.repository;

import CampusConnect.Application.connect.entity.GoogleUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GoogleUserRepository extends JpaRepository<GoogleUser, Long> {
    Optional<GoogleUser> findByGoogleId(String googleId);
}
