package CampusConnect.Application.connect.controller;

import CampusConnect.Application.connect.entity.Comment;
import CampusConnect.Application.connect.entity.Post;
import CampusConnect.Application.connect.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@Tag(name = "Posts & Feed", description = "Campus posts, smart recommendation feed, likes, and comments")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    @Operation(summary = "Create a campus post")
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        if (post.getContent() == null || post.getContent().isBlank()) {
            throw new IllegalArgumentException("Post content cannot be empty");
        }
        if (post.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }
        Post created = postService.createPost(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Get all campus posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/feed")
    @Operation(summary = "Get smart recommendation post feed with pagination (ranked by likes, comments, and recency)")
    public ResponseEntity<Page<Post>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(postService.getFeed(page, size));
    }

    @PostMapping("/{postId}/like")
    @Operation(summary = "Like a post")
    public ResponseEntity<Void> likePost(@PathVariable Long postId, @RequestParam Long userId) {
        postService.likePost(postId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{postId}/comment")
    @Operation(summary = "Add a comment to a post")
    public ResponseEntity<Comment> addComment(@PathVariable Long postId, @RequestBody Comment commentRequest) {
        if (commentRequest.getContent() == null || commentRequest.getContent().isBlank()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }
        if (commentRequest.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }
        Comment created = postService.addComment(postId, commentRequest.getUserId(), commentRequest.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
