package com.autoguard.Service;

import com.autoguard.Model.KnowledgeArticle;
import com.autoguard.Repository.KnowledgeArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KnowledgeService {

    private final KnowledgeArticleRepository knowledgeArticleRepository;
    @Qualifier("knowledgeVectorStore")
    private final VectorStore knowledgeVectorStore;

    public KnowledgeArticle save(KnowledgeArticle article) {
        KnowledgeArticle savedArticle = knowledgeArticleRepository.save(article);
        index(savedArticle);
        return savedArticle;
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
        KnowledgeArticle article = findById(id);
        if (article.getEmbeddingVectorId() != null) {
            knowledgeVectorStore.delete(article.getEmbeddingVectorId());
        }
        knowledgeArticleRepository.deleteById(id);
    }

    public String findRelevantContext(String query) {
        List<Document> matches = knowledgeVectorStore.similaritySearch(
                SearchRequest.builder().query(query).topK(3).similarityThreshold(0.55).build());

        if (matches == null || matches.isEmpty()) {
            return "No relevant maintenance knowledge-base articles were found.";
        }

        return matches.stream()
                .map(Document::getText)
                .reduce((first, second) -> first + "\n\n" + second)
                .orElse("No relevant maintenance knowledge-base articles were found.");
    }

    @PostConstruct
    void rebuildIndex() {
        knowledgeArticleRepository.findAll().forEach(this::index);
    }

    private void index(KnowledgeArticle article) {
        String vectorId = article.getEmbeddingVectorId();
        if (vectorId == null || vectorId.isBlank()) {
            vectorId = UUID.randomUUID().toString();
            article.setEmbeddingVectorId(vectorId);
            knowledgeArticleRepository.save(article);
        } else {
            knowledgeVectorStore.delete(vectorId);
        }

        String content = "Title: " + article.getTitle()
                + "\nCategory: " + (article.getCategory() == null ? "General" : article.getCategory())
                + "\nContent: " + (article.getContent() == null ? "" : article.getContent());
        knowledgeVectorStore.add(List.of(new Document(vectorId, content,
                Map.of("articleId", article.getId(), "title", article.getTitle()))));
    }
}
