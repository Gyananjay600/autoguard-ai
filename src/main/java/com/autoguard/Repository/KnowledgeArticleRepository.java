package com.autoguard.Repository;

import com.autoguard.Model.KnowledgeArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, Long> {
    List<KnowledgeArticle> findByCategory(String category);
    List<KnowledgeArticle> findByTitleContainingIgnoreCase(String keyword);
}