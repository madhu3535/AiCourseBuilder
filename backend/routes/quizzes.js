// backend/routes/quizzes.js 
router.post('/lessons/:lessonId/quiz', createQuiz);
router.put('/quiz/:id', updateQuiz);