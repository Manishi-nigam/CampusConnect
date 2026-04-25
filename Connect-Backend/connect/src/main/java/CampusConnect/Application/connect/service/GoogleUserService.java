package CampusConnect.Application.connect.service;

import CampusConnect.Application.connect.entity.GoogleUser;
import CampusConnect.Application.connect.repository.GoogleUserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class GoogleUserService {
    private final GoogleUserRepository googleUserRepository;

    public GoogleUserService(GoogleUserRepository googleUserRepository) {
        this.googleUserRepository = googleUserRepository;
    }

    public GoogleUser saveOrUpdate(OAuth2User oAuth2User) {
        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        return googleUserRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    GoogleUser user = new GoogleUser();
                    user.setGoogleId(googleId);
                    user.setEmail(email);
                    user.setName(name);
                    user.setPictureUrl(picture);
                    return googleUserRepository.save(user);
                });
    }
}
