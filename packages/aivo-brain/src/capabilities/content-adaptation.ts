import type { 
  ProviderManager 
} from '../providers/provider-manager';
import type {
  AIRequest,
  AIResponse,
  ContentAdaptationRequest,
  AdaptedContent,
  EducationalContext} from '../types';
import {
  TaskType,
  Priority
} from '../types';

/**
 * Content Adaptation Service
 * Adapts educational content to different grade levels, learning styles, and accessibility needs
 */
export class ContentAdaptationService {
  constructor(private providerManager: ProviderManager) {}

  /**
   * Adapt content for a specific grade level
   */
  async adaptContentForGradeLevel(
    content: string,
    originalGrade: string,
    targetGrade: string,
    context: EducationalContext
  ): Promise<AdaptedContent> {
    const request: ContentAdaptationRequest = {
      originalContent: content,
      targetAudience: {
        gradeLevel: targetGrade,
        learningStyle: 'mixed',
        accommodations: context.accommodations || []
      },
      adaptationType: 'grade_level',
      context,
      options: {
        preserveKeyLearningObjectives: true,
        adjustComplexity: true,
        includeVisualAids: true
      }
    };

    return this.adaptContent(request);
  }

  /**
   * Adapt content for different learning styles
   */
  async adaptContentForLearningStyle(
    content: string,
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed',
    context: EducationalContext
  ): Promise<AdaptedContent> {
    const request: ContentAdaptationRequest = {
      originalContent: content,
      targetAudience: {
        gradeLevel: context.gradeLevel,
        learningStyle,
        accommodations: []
      },
      adaptationType: 'learning_style',
      context,
      options: {
        preserveKeyLearningObjectives: true,
        adjustComplexity: false,
        includeVisualAids: learningStyle === 'visual',
        includeAudioSuggestions: learningStyle === 'auditory',
        includeHandsOnActivities: learningStyle === 'kinesthetic'
      }
    };

    return this.adaptContent(request);
  }

  /**
   * Adapt content for accessibility needs
   */
  async adaptContentForAccessibility(
    content: string,
    accommodations: string[],
    context: EducationalContext
  ): Promise<AdaptedContent> {
    const request: ContentAdaptationRequest = {
      originalContent: content,
      targetAudience: {
        gradeLevel: context.gradeLevel,
        learningStyle: 'mixed',
        accommodations
      },
      adaptationType: 'accessibility',
      context,
      options: {
        preserveKeyLearningObjectives: true,
        adjustComplexity: false,
        includeVisualAids: accommodations.includes('visual_support'),
        simplifyLanguage: accommodations.includes('simplified_language'),
        addStructuralElements: accommodations.includes('clear_structure')
      }
    };

    return this.adaptContent(request);
  }

  /**
   * Adapt content for English Language Learners (ELL)
   */
  async adaptContentForELL(
    content: string,
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced',
    nativeLanguage: string,
    context: EducationalContext
  ): Promise<AdaptedContent> {
    const request: ContentAdaptationRequest = {
      originalContent: content,
      targetAudience: {
        gradeLevel: context.gradeLevel,
        learningStyle: 'mixed',
        accommodations: [`ell_${proficiencyLevel}`, `native_${nativeLanguage}`]
      },
      adaptationType: 'language_support',
      context,
      options: {
        preserveKeyLearningObjectives: true,
        adjustComplexity: proficiencyLevel === 'beginner',
        includeVisualAids: true,
        simplifyLanguage: proficiencyLevel !== 'advanced',
        includeGlossary: true,
        addCulturalContext: true
      }
    };

    return this.adaptContent(request);
  }

  /**
   * Main content adaptation method
   */
  async adaptContent(request: ContentAdaptationRequest): Promise<AdaptedContent> {
    const prompt = this.buildContentAdaptationPrompt(request);
    
    const aiRequest: AIRequest = {
      id: crypto.randomUUID(),
      taskType: TaskType.CONTENT_ADAPTATION,
      prompt,
      context: {
        originalContent: request.originalContent,
        adaptationType: request.adaptationType,
        targetAudience: request.targetAudience
      },
      options: {
        maxTokens: 6000,
        temperature: 0.3,
        topP: 0.8,
        retries: 3,
        stream: false
      },
      metadata: {
        gradeLevel: request.context.gradeLevel,
        subject: request.context.subject,
        language: request.context.language,
        priority: Priority.NORMAL
      }
    };

    try {
      const response = await this.providerManager.generateCompletion(aiRequest);
      return this.parseAdaptedContentFromResponse(response, request);
    } catch (error) {
      console.error('Content adaptation failed:', error);
      throw new Error(`Failed to adapt content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildContentAdaptationPrompt(request: ContentAdaptationRequest): string {
    let prompt = `Adapt the following educational content for the specified audience and requirements.\n\n`;
    
    prompt += `Original Content:\n${request.originalContent}\n\n`;
    
    prompt += `Adaptation Requirements:\n`;
    prompt += `- Type: ${request.adaptationType}\n`;
    prompt += `- Target Grade Level: ${request.targetAudience.gradeLevel}\n`;
    prompt += `- Learning Style: ${request.targetAudience.learningStyle}\n`;
    
    if (request.targetAudience.accommodations.length > 0) {
      prompt += `- Accommodations: ${request.targetAudience.accommodations.join(', ')}\n`;
    }
    
    prompt += `- Subject: ${request.context.subject}\n`;
    prompt += `- Language: ${request.context.language}\n`;

    // Add specific adaptation instructions based on type
    switch (request.adaptationType) {
      case 'grade_level':
        prompt += `\nGrade Level Adaptation Instructions:
- Adjust vocabulary to be age-appropriate
- Modify sentence complexity and length
- Update examples and references to be relatable
- Ensure concepts are developmentally appropriate
- Maintain educational rigor while improving accessibility`;
        break;
      
      case 'learning_style':
        prompt += this.getLearningStyleInstructions(request.targetAudience.learningStyle);
        break;
      
      case 'accessibility':
        prompt += `\nAccessibility Adaptation Instructions:
- Use clear, simple language structure
- Add headings and organizational elements
- Include alternative text descriptions for visual elements
- Provide multiple ways to access the same information
- Ensure content is screen reader friendly`;
        break;
      
      case 'language_support':
        prompt += `\nLanguage Support Instructions:
- Simplify complex sentence structures
- Define key vocabulary terms
- Use cognates when possible
- Provide visual context clues
- Include cultural bridges to native language experiences`;
        break;
    }

    if (request.options?.preserveKeyLearningObjectives) {
      prompt += `\n- CRITICAL: Preserve all key learning objectives and educational goals`;
    }

    if (request.options?.includeVisualAids) {
      prompt += `\n- Include suggestions for visual aids, diagrams, or multimedia elements`;
    }

    if (request.options?.includeGlossary) {
      prompt += `\n- Include a glossary of key terms with simple definitions`;
    }

    if (request.options?.addCulturalContext) {
      prompt += `\n- Add cultural context and connections where appropriate`;
    }

    prompt += `\nFormat the response as JSON with the following structure:
{
  "adaptedContent": "the fully adapted content text",
  "changes": [
    {
      "type": "vocabulary|structure|examples|formatting|other",
      "description": "what was changed and why",
      "impact": "how this helps the target audience"
    }
  ],
  "learningObjectives": ["preserved learning objective 1", "preserved learning objective 2"],
  "visualAidSuggestions": ["suggestion 1", "suggestion 2"],
  "glossary": {
    "term1": "simple definition",
    "term2": "simple definition"
  },
  "additionalResources": ["resource 1", "resource 2"],
  "metadata": {
    "readabilityLevel": "grade level equivalent",
    "estimatedReadingTime": "minutes",
    "cognitiveLoad": 1-5_scale,
    "adaptationScore": 1-10_effectiveness
  }
}`;

    return prompt;
  }

  private getLearningStyleInstructions(learningStyle: string): string {
    switch (learningStyle) {
      case 'visual':
        return `\nVisual Learning Style Instructions:
- Add descriptions of charts, graphs, diagrams, and visual representations
- Use bullet points, numbered lists, and clear formatting
- Include color coding and visual organization suggestions
- Suggest infographics and visual metaphors
- Organize content with clear visual hierarchy`;

      case 'auditory':
        return `\nAuditory Learning Style Instructions:
- Include discussion questions and dialogue elements
- Add rhythm, rhyme, or musical mnemonics where appropriate
- Suggest read-aloud activities and verbal explanations
- Include opportunities for verbal repetition and discussion
- Add storytelling elements and narrative structure`;

      case 'kinesthetic':
        return `\nKinesthetic Learning Style Instructions:
- Include hands-on activities and experiments
- Add movement-based learning suggestions
- Include manipulatives and interactive elements
- Suggest role-playing and simulation activities
- Add opportunities for physical practice and application`;

      case 'reading':
        return `\nReading/Writing Learning Style Instructions:
- Provide detailed written explanations and instructions
- Include note-taking opportunities and templates
- Add writing activities and journaling prompts
- Suggest additional reading materials and references
- Include word-based puzzles and written exercises`;

      default:
        return `\nMixed Learning Style Instructions:
- Include elements for visual, auditory, kinesthetic, and reading learners
- Provide multiple pathways to access the same information
- Balance different types of activities and representations
- Offer choice in how students can engage with content`;
    }
  }

  private parseAdaptedContentFromResponse(response: AIResponse, request: ContentAdaptationRequest): AdaptedContent {
    try {
      const content = response.content.trim();
      let jsonStr = content;
      
      // Handle cases where the response includes markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr);
      
      return {
        id: crypto.randomUUID(),
        originalContent: request.originalContent,
        adaptedContent: parsed.adaptedContent,
        adaptationType: request.adaptationType,
        targetAudience: request.targetAudience,
        changes: parsed.changes || [],
        learningObjectives: parsed.learningObjectives || [],
        visualAidSuggestions: parsed.visualAidSuggestions || [],
        glossary: parsed.glossary || {},
        additionalResources: parsed.additionalResources || [],
        metadata: {
          readabilityLevel: parsed.metadata?.readabilityLevel || 'Unknown',
          estimatedReadingTime: parsed.metadata?.estimatedReadingTime || 'Unknown',
          cognitiveLoad: parsed.metadata?.cognitiveLoad || 3,
          adaptationScore: parsed.metadata?.adaptationScore || 5
        },
        createdAt: new Date(),
        version: '1.0'
      };

    } catch (error) {
      console.error('Failed to parse adapted content from response:', error);
      console.log('Raw response:', response.content);
      
      // Fallback: return basic adaptation
      return {
        id: crypto.randomUUID(),
        originalContent: request.originalContent,
        adaptedContent: response.content,
        adaptationType: request.adaptationType,
        targetAudience: request.targetAudience,
        changes: [{
          type: 'other',
          description: 'AI-generated adaptation (parsing failed)',
          impact: 'Content adapted but structure not parsed'
        }],
        learningObjectives: [],
        visualAidSuggestions: [],
        glossary: {},
        additionalResources: [],
        metadata: {
          readabilityLevel: 'Unknown',
          estimatedReadingTime: 'Unknown',
          cognitiveLoad: 3,
          adaptationScore: 3
        },
        createdAt: new Date(),
        version: '1.0'
      };
    }
  }

  /**
   * Batch adapt content for multiple audiences
   */
  async batchAdaptContent(
    content: string,
    adaptations: Array<{
      type: ContentAdaptationRequest['adaptationType'];
      audience: ContentAdaptationRequest['targetAudience'];
      context: EducationalContext;
    }>
  ): Promise<AdaptedContent[]> {
    const promises = adaptations.map(adaptation => {
      const request: ContentAdaptationRequest = {
        originalContent: content,
        targetAudience: adaptation.audience,
        adaptationType: adaptation.type,
        context: adaptation.context,
        options: {
          preserveKeyLearningObjectives: true,
          adjustComplexity: true,
          includeVisualAids: true
        }
      };
      return this.adaptContent(request);
    });

    return Promise.all(promises);
  }
}