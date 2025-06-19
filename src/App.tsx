
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Download, Play, AlertCircle, ExternalLink } from 'lucide-react';
import loadingAnimation from './Animation - 1750332876998.json';

interface VideoFormat {
  url: string;
  qualityLabel?: string;
  mimeType?: string;
  filesize?: number;
  quality?: string;
  itag?: number;
}

const Index: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [videoId, setVideoId] = useState('');
  const [downloadLinks, setDownloadLinks] = useState<VideoFormat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');

  const extractVideoId = useCallback((urlOrId: string): string | null => {
    if (!urlOrId.trim()) return null;
    
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = urlOrId.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }, []);

  const validateInput = useCallback((input: string): boolean => {
    return input.trim().length > 0 && extractVideoId(input) !== null;
  }, [extractVideoId]);

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getQualityColor = (quality: string): string => {
    const q = quality?.toLowerCase();
    if (q?.includes('1080') || q?.includes('hd')) return 'text-green-400';
    if (q?.includes('720')) return 'text-blue-400';
    if (q?.includes('480')) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const handleDownload = async () => {
    if (!validateInput(inputValue)) {
      setError('Please enter a valid YouTube URL or video ID');
      return;
    }

    setLoading(true);
    setError('');
    setDownloadLinks([]);
    setActiveVideoUrl(null);
    
    const id = extractVideoId(inputValue);
    if (!id) {
      setError('Invalid YouTube URL or video ID');
      setLoading(false);
      return;
    }
    
    setVideoId(id);

    try {
      const url = `https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${id}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com',
          'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY as string,
        },
      };

      if (!import.meta.env.VITE_RAPIDAPI_KEY) {
        throw new Error('API key is not configured');
      }

      const res = await fetch(url, options);
      
      if (!res.ok) {
        throw new Error(`API request failed with status: ${res.status}`);
      }
      
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.title) {
        setVideoTitle(data.title);
      }

      if (data && (data.formats || data.adaptiveFormats)) {
        const combinedFormats = [
          ...(data.formats || []),
          ...(data.adaptiveFormats || []),
        ];
        
        // Filter and sort formats
        const filteredFormats = combinedFormats
          .filter((format: VideoFormat) => format.url)
          .sort((a: VideoFormat, b: VideoFormat) => {
            // Sort by quality (higher first)
            const getQualityNum = (quality: string) => {
              const match = quality?.match(/(\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            return getQualityNum(b.qualityLabel || '') - getQualityNum(a.qualityLabel || '');
          });

        if (filteredFormats.length === 0) {
          throw new Error('No valid download links found');
        }

        setDownloadLinks(filteredFormats);
      } else {
        throw new Error('No download links found in the response');
      }
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Error fetching download links. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDownload();
    }
  };

  const handleFormatClick = (format: VideoFormat) => {
    setActiveVideoUrl(format.url);
  };

  const handleDirectDownload = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'video';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
      className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex flex-col lg:flex-row p-4 lg:p-8 gap-6"
    >
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center">
              <Lottie animationData={loadingAnimation} style={{ width: 150, height: 150 }} />
              <p className="text-white text-lg font-medium mt-4">Fetching video data...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Panel - Controls */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full lg:w-1/2 flex flex-col border border-white/20"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-3">
            Pro YouTube Downloader
          </h1>
          <p className="text-gray-300 text-lg">Download videos in multiple formats and qualities</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="url-input" className="block text-white text-sm font-medium mb-2">
              YouTube URL or Video ID
            </label>
            <input
              id="url-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg transition-all duration-200"
              placeholder="https://youtube.com/watch?v=... or video ID"
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={loading || !inputValue.trim()}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-2xl font-bold shadow-xl transition-all duration-200 text-xl flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Fetching...
              </>
            ) : (
              <>
                <Download size={24} />
                Fetch Download Links
              </>
            )}
          </motion.button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
              id="error-message"
              role="alert"
            >
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <p className="text-red-200 font-medium">{error}</p>
            </motion.div>
          )}

          {videoTitle && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500/30 rounded-xl p-4"
            >
              <p className="text-green-200 font-medium">📹 {videoTitle}</p>
            </motion.div>
          )}

          {downloadLinks.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-white text-center font-bold text-2xl">Available Formats</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {downloadLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl text-white cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-semibold text-lg ${getQualityColor(link.qualityLabel || '')}`}>
                        {link.qualityLabel || 'Unknown Quality'}
                      </span>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFormatClick(link);
                          }}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Play size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectDownload(link.url, `video_${link.qualityLabel}`);
                          }}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                          title="Download"
                        >
                          <ExternalLink size={16} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-300">
                      <span>{link.mimeType?.split(';')[0] || 'Unknown format'}</span>
                      <span>{formatFileSize(link.filesize || 0)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Right Panel - Preview */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4"
      >
        {videoId && !activeVideoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Video Thumbnail"
              className="w-full rounded-2xl shadow-2xl border border-white/20"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            <p className="text-white text-center mt-4 text-lg">Select a format above to preview</p>
          </motion.div>
        )}

        {activeVideoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl"
          >
            <video
              controls
              className="w-full h-[50vh] lg:h-[70vh] rounded-2xl shadow-2xl border border-white/20"
              src={activeVideoUrl}
              onError={() => setError('Failed to load video preview')}
            >
              Your browser does not support the video tag.
            </video>
            <p className="text-white text-center mt-4 text-sm opacity-75">
              Video preview - Right-click to save or use download button above
            </p>
          </motion.div>
        )}

        {!videoId && !activeVideoUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400"
          >
            <div className="w-32 h-32 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <Download size={48} className="text-gray-500" />
            </div>
            <p className="text-xl">Enter a YouTube URL to get started</p>
          </motion.div>
        )}
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </motion.div>
  );
};

export default App;

