package CampusConnect.Application.connect.controller;

import CampusConnect.Application.connect.entity.Comment;
import CampusConnect.Application.connect.entity.Post;
import CampusConnect.Application.connect.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        return postService.createPost(post);
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/feed")
    public List<Post> getFeed() {
        return postService.getFeed();
    }

    @PostMapping("/{postId}/like")
    public void likePost(@PathVariable Long postId, @RequestParam Long userId) {
        postService.likePost(postId, userId);
    }

    @PostMapping("/{postId}/comment")
    public Comment addComment(@PathVariable Long postId, @RequestBody Comment commentRequest) {
        return postService.addComment(postId, commentRequest.getUserId(), commentRequest.getContent());
    }
}
