package CampusConnect.Application.connect.repository;

import CampusConnect.Application.connect.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Post p ORDER BY ((p.likeCount * 2) + (p.commentCount * 3) + CASE WHEN p.createdAt >= :recentCutoff THEN 10.0 ELSE 0.0 END) DESC, p.createdAt DESC")
    Page<Post> findFeedWithScoring(@Param("recentCutoff") LocalDateTime recentCutoff, Pageable pageable);
}
