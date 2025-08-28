// backend/routes/ai.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generateCourseContent, generateQuizQuestions } from '../services/aiService.js';

const router = express.Router();

// Generate lesson content
router.post('/generate-content', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty = 'beginner' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const content = await generateCourseContent(topic, difficulty);
    
    res.json({
      content,
      topic,
      difficulty
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Generate quiz questions
router.post('/generate-quiz', authenticateToken, async (req, res) => {
  try {
    const { lessonContent, questionCount = 3 } = req.body;
    
    if (!lessonContent) {
      return res.status(400).json({ error: 'Lesson content is required' });
    }
    
    const questions = await generateQuizQuestions(lessonContent, questionCount);
    
    res.json({
      questions,
      questionCount: questions.length
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

export default router;
