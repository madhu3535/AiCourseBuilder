
// backend/services/aiService.js
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const generateCourseContent = async (topic, difficulty = 'beginner') => {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.warn('No Hugging Face API key found, using fallback content');
      return generateFallbackContent(topic, difficulty);
    }

    const prompt = `Create a comprehensive lesson about "${topic}" for ${difficulty} level learners. Include:

1. Introduction and overview
2. Key concepts and principles
3. Practical examples
4. Common mistakes to avoid
5. Next steps for learning

Format the response in markdown with clear headings.`;

    const response = await hf.textGeneration({
      model: 'gpt2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false
      }
    });

    return response.generated_text || generateFallbackContent(topic, difficulty);
  } catch (error) {
    console.error('AI content generation error:', error);
    return generateFallbackContent(topic, difficulty);
  }
};

export const generateVideoSearchQuery = async (lessonTitle, lessonContent) => {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      return lessonTitle;
    }

    const prompt = `Based on this lesson: "${lessonTitle}"
Content preview: ${lessonContent.substring(0, 200)}...
Generate the best YouTube search query (max 5 words):`;

    const response = await hf.textGeneration({
      model: 'gpt2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 20,
        temperature: 0.5,
        return_full_text: false
      }
    });

    return response.generated_text?.trim().replace(/['"]/g, '') || lessonTitle;
  } catch (error) {
    console.error('Search query generation error:', error);
    return lessonTitle;
  }
};

export const generateQuizQuestions = async (lessonContent, questionCount = 3) => {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      return generateFallbackQuiz(lessonContent, questionCount);
    }

    const response = await hf.textGeneration({
      model: 'gpt2',
      inputs: `Create ${questionCount} quiz questions about: ${lessonContent.substring(0, 300)}`,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.6,
        return_full_text: false
      }
    });

    return parseQuizResponse(response.generated_text) || generateFallbackQuiz(lessonContent, questionCount);
  } catch (error) {
    console.error('Quiz generation error:', error);
    return generateFallbackQuiz(lessonContent, questionCount);
  }
};

// Fallback functions
const generateFallbackContent = (topic, difficulty) => {
  return `# ${topic} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level)

## Introduction
This comprehensive lesson covers the fundamentals of ${topic} designed for ${difficulty} learners.

## Key Concepts
- Understanding the core principles of ${topic}
- Practical applications in real-world scenarios
- Best practices and industry standards
- Common patterns and methodologies

## Learning Objectives
By the end of this lesson, you will be able to:
- Explain the main concepts of ${topic}
- Apply ${topic} principles in practical situations
- Identify common mistakes and how to avoid them
- Continue learning with confidence

## Practical Examples
Let's explore some hands-on examples to reinforce your understanding of ${topic}.

## Common Mistakes to Avoid
- Rushing through the basics without proper understanding
- Not practicing regularly
- Ignoring best practices and conventions
- Not seeking help when needed

## Next Steps
- Practice with real projects
- Join communities and forums
- Explore advanced topics
- Build a portfolio of work

Continue your learning journey with confidence!`;
};

const generateFallbackQuiz = (content, count) => {
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push({
      id: Date.now() + i,
      question: `What is an important concept covered in this lesson?`,
      type: 'multiple-choice',
      options: [
        'Understanding the fundamentals',
        'Advanced implementation',
        'Complex algorithms',
        'All of the above'
      ],
      correctAnswer: 3,
      explanation: 'This lesson covers comprehensive understanding including fundamentals and practical applications.'
    });
  }
  return questions;
};

const parseQuizResponse = (text) => {
  // Simple parsing logic
  return null; // Return null to use fallback
};
