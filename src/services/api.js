// src/services/api.js 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods (existing)
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(name, email, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  }

  // Course methods (existing)
  async getCourses() {
    return this.request('/api/courses');
  }

  async createCourse(courseData) {
    return this.request('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }

  // NEW: Video search methods
  async searchVideos(lessonTitle, lessonContent, customQuery = null) {
    return this.request('/api/videos/search', {
      method: 'POST',
      body: JSON.stringify({ 
        lessonTitle, 
        lessonContent, 
        customQuery 
      })
    });
  }

  async getVideoChapters(videoId) {
    return this.request(`/api/videos/chapters/${videoId}`);
  }

  // NEW: AI content generation
  async generateLessonContent(topic, difficulty = 'beginner') {
    return this.request('/api/ai/generate-content', {
      method: 'POST',
      body: JSON.stringify({ topic, difficulty })
    });
  }

  async generateQuiz(lessonContent, questionCount = 3) {
    return this.request('/api/ai/generate-quiz', {
      method: 'POST',
      body: JSON.stringify({ lessonContent, questionCount })
    });
  }
}

export default new ApiService();

