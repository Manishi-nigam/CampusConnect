package CampusConnect.Application.connect.service;

import CampusConnect.Application.connect.entity.Comment;
import CampusConnect.Application.connect.entity.Like;
import CampusConnect.Application.connect.entity.Post;
import CampusConnect.Application.connect.repository.CommentRepository;
import CampusConnect.Application.connect.repository.LikeRepository;
import CampusConnect.Application.connect.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public PostService(PostRepository postRepository, LikeRepository likeRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    public Post createPost(Post post) {
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public void likePost(Long postId, Long userId) {
        if (likeRepository.existsByPostIdAndUserId(postId, userId)) {
            throw new RuntimeException("Already liked");
        }
        
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
            
        Like like = new Like();
        like.setPostId(postId);
        like.setUserId(userId);
        likeRepository.save(like);
        
        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);
    }

    public Comment addComment(Long postId, Long userId, String content) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
            
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        Comment savedComment = commentRepository.save(comment);
        
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);
        
        return savedComment;
    }

    public List<Post> getFeed() {
        List<Post> posts = postRepository.findAll();
        
        for (Post post : posts) {
            double score = (post.getLikeCount() * 2) + (post.getCommentCount() * 3);
            
            if (post.getCreatedAt().isAfter(LocalDateTime.now().minusHours(24))) {
                score += 10;
            }
            
            post.setScore(score);
        }
        
        posts.sort(java.util.Comparator.comparingDouble(Post::getScore).reversed());
        return posts;
    }
}