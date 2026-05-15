package com.autoguard.Service;

import com.autoguard.Model.KnowledgeArticle;
import com.autoguard.Repository.KnowledgeArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KnowledgeService {

    private final KnowledgeArticleRepository knowledgeArticleRepository;

    public KnowledgeArticle save(KnowledgeArticle article) {
        return knowledgeArticleRepository.save(article);
    }

    public List<KnowledgeArticle> getAll() {
        return knowledgeArticleRepository.findAll();
    }

    public KnowledgeArticle findById(Long id) {
        return knowledgeArticleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found: " + id));
    }

    public List<KnowledgeArticle> search(String keyword) {
        return knowledgeArticleRepository
                .findByTitleContainingIgnoreCase(keyword);
    }

    public void delete(Long id) {
        knowledgeArticleRepository.deleteById(id);
    }
}