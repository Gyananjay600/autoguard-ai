import { query } from '../config/db.js';
import crypto from 'crypto';

export class KnowledgeService {
  /**
   * Retrieve all knowledge articles
   */
  static async getAll() {
    return await query('SELECT * FROM knowledge_articles ORDER BY id DESC');
  }

  /**
   * Find single article by ID
   */
  static async findById(id) {
    const rows = await query('SELECT * FROM knowledge_articles WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      throw new Error(`Knowledge base article not found with ID: ${id}`);
    }
    return rows[0];
  }

  /**
   * Search knowledge base by keyword matching title or content
   */
  static async search(keyword) {
    const term = `%${keyword}%`;
    return await query(
      'SELECT * FROM knowledge_articles WHERE title LIKE ? OR content LIKE ? OR category LIKE ? ORDER BY id DESC',
      [term, term, term]
    );
  }

  /**
   * Create or update knowledge article
   */
  static async save(article) {
    const vectorId = article.embedding_vector_id || article.embeddingVectorId || crypto.randomUUID();

    if (article.id) {
      await query(
        `UPDATE knowledge_articles 
         SET title = ?, category = ?, content = ?, embedding_vector_id = ? 
         WHERE id = ?`,
        [article.title, article.category || 'General', article.content || '', vectorId, article.id]
      );
      return await this.findById(article.id);
    } else {
      const result = await query(
        `INSERT INTO knowledge_articles (title, category, content, embedding_vector_id)
         VALUES (?, ?, ?, ?)`,
        [article.title, article.category || 'General', article.content || '', vectorId]
      );
      return await this.findById(result.insertId);
    }
  }

  /**
   * Delete knowledge article
   */
  static async delete(id) {
    await this.findById(id);
    await query('DELETE FROM knowledge_articles WHERE id = ?', [id]);
    return { success: true };
  }

  /**
   * RAG Context Retrieval:
   * Scores knowledge base articles using token overlap and TF-IDF relevance against the query.
   * Returns top 3 grounded manual excerpts.
   */
  static async findRelevantContext(searchQuery) {
    const articles = await query('SELECT id, title, category, content FROM knowledge_articles');
    if (!articles || articles.length === 0) {
      return 'No relevant maintenance knowledge-base articles were found.';
    }

    if (!searchQuery || !searchQuery.trim()) {
      return articles.slice(0, 2).map(a => `[Manual Ref: ${a.title} (${a.category})]\n${a.content}`).join('\n\n');
    }

    // Tokenize search query into lowercase keywords (filtering small stop words)
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'for', 'on', 'with', 'by', 'at', 'from']);
    const queryTokens = searchQuery
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // Score each article
    const scoredArticles = articles.map(article => {
      const textToSearch = `${article.title} ${article.category || ''} ${article.content || ''}`.toLowerCase();
      let score = 0;

      for (const token of queryTokens) {
        if (article.title.toLowerCase().includes(token)) score += 3.0;
        if (article.category && article.category.toLowerCase().includes(token)) score += 2.0;

        // Occurrences in content
        const regex = new RegExp(`\\b${token}\\b`, 'g');
        const matches = textToSearch.match(regex);
        if (matches) score += matches.length * 0.5;
      }

      return { article, score };
    });

    // Sort by descending score
    scoredArticles.sort((a, b) => b.score - a.score);

    // Pick matches with score > 0, fallback to top articles if needed
    const topMatches = scoredArticles
      .filter(item => item.score > 0)
      .slice(0, 3)
      .map(item => item.article);

    const matchesToUse = topMatches.length > 0 ? topMatches : articles.slice(0, 2);

    return matchesToUse
      .map(a => `[Technical Bulletin: ${a.title} | Category: ${a.category || 'General'}]\n${a.content}`)
      .join('\n\n');
  }
}

export default KnowledgeService;
