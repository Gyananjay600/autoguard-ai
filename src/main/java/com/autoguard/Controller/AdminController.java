package com.autoguard.Controller;

import com.autoguard.Repository.AIRequestLogRepository;
import com.autoguard.enums.UserRole;
import com.autoguard.Model.KnowledgeArticle;
import com.autoguard.Service.KnowledgeService;
import com.autoguard.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AIRequestLogRepository aiRequestLogRepository;
    private final KnowledgeService knowledgeService;
    private final UserService userService;

    @GetMapping("/panel")
    public String adminPanel(Model model) {
        model.addAttribute("articles", knowledgeService.getAll());
        model.addAttribute("users", userService.getAllUsers());
        model.addAttribute("aiLogs",
                aiRequestLogRepository.findAllByOrderByCreatedAtDesc());
        return "admin/panel";
    }

    @GetMapping("/knowledge/new")
    public String newArticleForm(Model model) {
        model.addAttribute("article", new KnowledgeArticle());
        return "admin/knowledge-form";
    }

    @PostMapping("/knowledge/save")
    public String saveArticle(@ModelAttribute KnowledgeArticle article) {
        knowledgeService.save(article);
        return "redirect:/admin/panel";
    }

    @GetMapping("/knowledge/{id}/edit")
    public String editArticle(@PathVariable Long id, Model model) {
        model.addAttribute("article", knowledgeService.findById(id));
        return "admin/knowledge-form";
    }

    @PostMapping("/knowledge/{id}/delete")
    public String deleteArticle(@PathVariable Long id) {
        knowledgeService.delete(id);
        return "redirect:/admin/panel";
    }

    @PostMapping("/users/{id}/role")
    public String updateRole(@PathVariable Long id,
                             @RequestParam UserRole role) {
        userService.updateRole(id, role);
        return "redirect:/admin/panel";
    }
}
