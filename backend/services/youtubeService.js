// backend/services/youtubeService.js
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY//Ensure you have your YouTube API key in environment variables
});

export const searchYouTubeVideos = async (query, maxResults = 5) => {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults,
      order: 'relevance',
      videoDuration: 'medium', // 4-20 minutes
      videoDefinition: 'high',
      safeSearch: 'strict'
    });

    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    throw new Error('Failed to search YouTube videos');
  }
};

export const getVideoChapters = async (videoId) => {
  try {
    // Method 1: Try to get chapters from video details
    const response = await youtube.videos.list({
      part: 'snippet,contentDetails',
      id: videoId
    });

    const video = response.data.items[0];
    if (!video) return [];

    const description = video.snippet.description;
    
    // Parse timestamps from description (common format: 0:00 Chapter Name)
    const timestampRegex = /(\d{1,2}:\d{2}(?::\d{2})?)\s*(.+?)(?=\n|\d{1,2}:\d{2}|$)/g;
    const chapters = [];
    let match;

    while ((match = timestampRegex.exec(description)) !== null) {
      const timeStr = match[1];
      const title = match[2].trim();
      
      // Convert time to seconds
      const timeParts = timeStr.split(':').map(Number);
      const seconds = timeParts.length === 3 
        ? timeParts * 3600 + timeParts[1] * 60 + timeParts[2]
        : timeParts * 60 + timeParts[1];

      chapters.push({
        title,
        startTime: seconds,
        timestamp: timeStr
      });
    }

    // If no chapters found, create default segments
    if (chapters.length === 0) {
      const duration = parseDuration(video.contentDetails.duration);
      const segmentDuration = Math.max(300, Math.floor(duration / 4)); // 5 min segments or divide by 4
      
      for (let i = 0; i < Math.min(4, Math.floor(duration / segmentDuration)); i++) {
        chapters.push({
          title: `Part ${i + 1}`,
          startTime: i * segmentDuration,
          timestamp: formatTime(i * segmentDuration)
        });
      }
    }

    return chapters;
  } catch (error) {
    console.error('Error getting video chapters:', error);
    return [];
  }
};

const parseDuration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
