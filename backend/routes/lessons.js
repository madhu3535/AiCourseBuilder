// backend/routes/lessons.js
router.post('/modules/:moduleId/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);