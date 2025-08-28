// backend/routes/videos.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { searchYouTubeVideos, getVideoChapters } from '../services/youtubeService.js';
import { generateVideoSearchQuery, generateCourseContent } from '../services/aiService.js';

const router = express.Router();

// Search videos for a lesson
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const { lessonTitle, lessonContent, customQuery } = req.body;

    let searchQuery;
    if (customQuery) {
      searchQuery = customQuery;
    } else {
      // Use AI to generate optimal search query
      searchQuery = await generateVideoSearchQuery(lessonTitle, lessonContent);
    }

    const videos = await searchYouTubeVideos(searchQuery, 8);
    
    // Get chapters for each video
    const videosWithChapters = await Promise.all(
      videos.map(async (video) => {
        const chapters = await getVideoChapters(video.videoId);
        return {
          ...video,
          chapters,
          searchQuery
        };
      })
    );

    res.json({
      query: searchQuery,
      videos: videosWithChapters
    });
  } catch (error) {
    console.error('Video search error:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

// Get chapters for a specific video
router.get('/chapters/:videoId', authenticateToken, async (req, res) => {
  try {
    const { videoId } = req.params;
    const chapters = await getVideoChapters(videoId);
    res.json({ chapters });
  } catch (error) {
    console.error('Chapters fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch video chapters' });
  }
});

export default router;
