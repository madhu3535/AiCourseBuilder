// src/components/VideoSearchModal.jsx
import React, { useState, useEffect } from 'react';
import { Search, X, Loader, Play, Clock, Filter } from 'lucide-react';
import apiService from '../services/api';
import YouTubePlayer from './YouTubePlayer';

const VideoSearchModal = ({ isOpen, onClose, lesson, onVideoSelect }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && lesson) {
      performSearch();
    }
  }, [isOpen, lesson]);

  const performSearch = async (customQuery = null) => {
    if (!lesson) return;

    setIsSearching(true);
    try {
      const result = await apiService.searchVideos(
        lesson.title,
        lesson.content,
        customQuery
      );
      
      setSearchResults(result.videos);
      setCurrentSearchQuery(result.query);
    } catch (error) {
      console.error('Video search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCustomSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleVideoSelect = (video, chapter = null) => {
    const videoData = {
      videoId: video.videoId,
      url: `https://youtube.com/watch?v=${video.videoId}`,
      title: video.title,
      startTime: chapter?.startTime || 0,
      endTime: chapter?.startTime ? chapter.startTime + 300 : 0, // 5 min default
      chapters: video.chapters || []
    };

    onVideoSelect(videoData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Find Videos for "{lesson?.title}"
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              AI suggested: "{currentSearchQuery}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Search */}
        <div className="p-6 border-b">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search with custom keywords..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
              />
            </div>
            <button
              onClick={handleCustomSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSearching ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex h-[70vh]">
          {/* Video List */}
          <div className="w-1/2 p-6 overflow-y-auto border-r">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Play className="w-4 h-4 mr-2" />
              Found Videos ({searchResults.length})
            </h3>

            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Searching videos...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((video) => (
                  <div
                    key={video.videoId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVideo?.videoId === video.videoId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="flex gap-3">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-24 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {video.channelTitle}
                        </p>
                        {video.chapters.length > 0 && (
                          <div className="flex items-center text-xs text-blue-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {video.chapters.length} chapters available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick chapter selection */}
                    {video.chapters.length > 0 && selectedVideo?.videoId === video.videoId && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-600 mb-2">Select chapter:</p>
                        <div className="space-y-1">
                          {video.chapters.slice(0, 3).map((chapter, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVideoSelect(video, chapter);
                              }}
                              className="w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-between"
                            >
                              <span className="truncate">{chapter.title}</span>
                              <span className="text-gray-500 ml-2">{chapter.timestamp}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Select full video button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoSelect(video);
                      }}
                      className="mt-2 w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Use This Video
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Preview */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {selectedVideo ? (
              <YouTubePlayer
                video={selectedVideo}
                chapters={selectedVideo.chapters}
                onChapterClick={(chapter) => console.log('Chapter clicked:', chapter)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a video to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSearchModal;
