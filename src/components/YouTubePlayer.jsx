// src/components/YouTubePlayer.jsx
import React, { useState } from 'react';
import { Play, Clock, ExternalLink, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

const YouTubePlayer = ({ video, chapters = [], onChapterClick }) => {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showChapters, setShowChapters] = useState(true);

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter);
    onChapterClick && onChapterClick(chapter);
  };

  const getEmbedUrl = (videoId, startTime = 0) => {
    return `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1&rel=0&modestbranding=1`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Video Player */}
      <div className="aspect-video bg-gray-900">
        <iframe
          src={getEmbedUrl(
            video.videoId, 
            selectedChapter?.startTime || 0
          )}
          title={video.title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {video.title}
        </h3>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span className="mr-4">{video.channelTitle}</span>
          <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
        </div>

        {/* Chapters */}
        {chapters.length > 0 && (
          <div className="border-t pt-4">
            <button
              onClick={() => setShowChapters(!showChapters)}
              className="flex items-center justify-between w-full text-left mb-3 font-medium text-gray-900"
            >
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Video Chapters ({chapters.length})
              </span>
              {showChapters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {showChapters && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {chapters.map((chapter, index) => (
                  <button
                    key={index}
                    onClick={() => handleChapterClick(chapter)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedChapter?.startTime === chapter.startTime
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <Clock className="w-3 h-3 mr-1 text-gray-500" />
                          <span className="text-xs font-mono text-gray-500">
                            {chapter.timestamp}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900">
                          {chapter.title}
                        </h4>
                      </div>
                      <Play className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <a
            href={`https://youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open in YouTube
          </a>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
