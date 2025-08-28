import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all courses for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user.id },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                quizzes: {
                  include: { questions: true }
                }
              },
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        _count: { select: { enrollments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create new course
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, difficulty, duration, category, topics } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Course title is required' });
    }

    // Create course with modules if topics provided
    const courseData = {
      title,
      description,
      difficulty: difficulty || 'Beginner',
      duration,
      category,
      instructorId: req.user.id,
      thumbnail: `https://via.placeholder.com/400x240/6366F1/FFFFFF?text=${encodeURIComponent(title.substring(0, 20))}`
    };

    let course;
    if (topics) {
      const topicList = topics.split(',').map(t => t.trim());
      course = await prisma.course.create({
        data: {
          ...courseData,
          modules: {
            create: topicList.map((topic, index) => ({
              title: topic,
              orderIndex: index + 1,
              lessons: {
                create: [
                  {
                    title: `Introduction to ${topic}`,
                    content: `This comprehensive lesson covers the fundamentals of ${topic}. We'll explore key concepts, practical applications, and real-world examples.`,
                    orderIndex: 1,
                    duration: "10 min"
                  },
                  {
                    title: `Advanced ${topic}`,
                    content: `Deep dive into advanced ${topic} concepts and best practices. Learn industry-standard techniques.`,
                    orderIndex: 2,
                    duration: "15 min"
                  }
                ]
              }
            }))
          }
        },
        include: {
          modules: {
            include: { lessons: true },
            orderBy: { orderIndex: 'asc' }
          }
        }
      });
    } else {
      course = await prisma.course.create({
        data: courseData,
        include: { modules: true }
      });
    }

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Get specific course
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await prisma.course.findFirst({
      where: {
        id: req.params.id,
        instructorId: req.user.id
      },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                quizzes: {
                  include: { questions: true }
                }
              },
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Update course
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, difficulty, duration, category, status, isPublic } = req.body;

    const course = await prisma.course.findFirst({
      where: {
        id: req.params.id,
        instructorId: req.user.id
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(difficulty && { difficulty }),
        ...(duration && { duration }),
        ...(category && { category }),
        ...(status && { status }),
        ...(typeof isPublic === 'boolean' && { isPublic })
      },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                quizzes: { include: { questions: true } }
              }
            }
          }
        }
      }
    });

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await prisma.course.findFirst({
      where: {
        id: req.params.id,
        instructorId: req.user.id
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await prisma.course.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
