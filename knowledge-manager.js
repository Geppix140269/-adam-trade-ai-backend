const fs = require('fs');
const path = require('path');

class KnowledgeManager {
  constructor() {
    this.knowledgeBase = null;
    this.loadKnowledgeBase();
  }

  loadKnowledgeBase() {
    try {
      const filePath = path.join(__dirname, 'knowledge-base.json');
      const data = fs.readFileSync(filePath, 'utf8');
      this.knowledgeBase = JSON.parse(data);
      console.log('✅ Knowledge base loaded successfully');
    } catch (error) {
      console.error('❌ Error loading knowledge base:', error.message);
      this.knowledgeBase = null;
    }
  }

  /**
   * Search for relevant content based on user query
   * Returns context to include in AI prompt
   */
  search(query) {
    if (!this.knowledgeBase) {
      return null;
    }

    const queryLower = query.toLowerCase();
    let relevantContent = [];

    // Search through modules
    this.knowledgeBase.modules.forEach(module => {
      const moduleText = `${module.title} ${module.description} ${module.keyTopics.join(' ')} ${module.content}`.toLowerCase();

      if (moduleText.includes(queryLower.split(' ')[0]) ||
          queryLower.split(' ').some(word => word.length > 3 && moduleText.includes(word))) {

        relevantContent.push({
          type: 'module',
          title: module.title,
          content: module.content !== 'PLACEHOLDER: Add your module 1 content here. Include definitions, explanations, examples, and key concepts.' ? module.content : null,
          keyTopics: module.keyTopics
        });

        // Add relevant FAQs from this module
        module.faqs.forEach(faq => {
          if (faq.question.toLowerCase().includes(queryLower) ||
              faq.answer.toLowerCase().includes(queryLower)) {
            relevantContent.push({
              type: 'faq',
              question: faq.question,
              answer: faq.answer
            });
          }
        });

        // Add relevant examples
        module.examples.forEach(example => {
          if (example.title.toLowerCase().includes(queryLower) ||
              example.content.toLowerCase().includes(queryLower)) {
            relevantContent.push({
              type: 'example',
              title: example.title,
              content: example.content
            });
          }
        });
      }
    });

    // Search glossary
    this.knowledgeBase.glossary.forEach(entry => {
      if (queryLower.includes(entry.term.toLowerCase())) {
        relevantContent.push({
          type: 'glossary',
          term: entry.term,
          definition: entry.definition
        });
      }
    });

    // Search general FAQs
    this.knowledgeBase.generalFAQs.forEach(faq => {
      if (faq.question.toLowerCase().includes(queryLower)) {
        relevantContent.push({
          type: 'general_faq',
          question: faq.question,
          answer: faq.answer
        });
      }
    });

    return relevantContent.length > 0 ? relevantContent : null;
  }

  /**
   * Build context string from search results
   */
  buildContext(searchResults) {
    if (!searchResults || searchResults.length === 0) {
      return `You are an AI tutor for ADAM's Global Trade Academy. Use your general knowledge about global trade to help students.

ADAM Teaching Principles:
${this.knowledgeBase.methodology.principles.map(p => `- ${p}`).join('\n')}`;
    }

    let context = `You are an AI tutor for ADAM's Global Trade Academy. Answer based on the following ADAM course content:

ADAM Teaching Principles:
${this.knowledgeBase.methodology.principles.map(p => `- ${p}`).join('\n')}

RELEVANT COURSE CONTENT:
`;

    searchResults.forEach((item, index) => {
      context += `\n[${index + 1}] `;

      switch (item.type) {
        case 'module':
          context += `Module: "${item.title}"\n`;
          if (item.content) {
            context += `Content: ${item.content}\n`;
          }
          context += `Key Topics: ${item.keyTopics.join(', ')}\n`;
          break;

        case 'faq':
          context += `FAQ:\nQ: ${item.question}\nA: ${item.answer}\n`;
          break;

        case 'example':
          context += `Example: "${item.title}"\n${item.content}\n`;
          break;

        case 'glossary':
          context += `Definition of "${item.term}": ${item.definition}\n`;
          break;

        case 'general_faq':
          context += `General FAQ:\nQ: ${item.question}\nA: ${item.answer}\n`;
          break;
      }
    });

    context += `\n---
Use the above ADAM course content to answer the student's question. If the content doesn't fully cover the question, supplement with general knowledge but maintain ADAM's teaching style.`;

    return context;
  }

  /**
   * Get full context for a user query
   */
  getContext(query) {
    const searchResults = this.search(query);
    return this.buildContext(searchResults);
  }

  /**
   * Get all available modules
   */
  getModules() {
    return this.knowledgeBase?.modules || [];
  }

  /**
   * Get methodology
   */
  getMethodology() {
    return this.knowledgeBase?.methodology || {};
  }
}

module.exports = new KnowledgeManager();
