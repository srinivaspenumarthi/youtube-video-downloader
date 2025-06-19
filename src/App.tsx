

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import loadingAnimation from './Animation - 1750332876998.json'; // Rename file correctly (no spaces)

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [videoId, setVideoId] = useState('');
  const [downloadLinks, setDownloadLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const extractVideoId = (urlOrId: string) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = urlOrId.match(regex);
    return match ? match[1] : urlOrId;
  };

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    setDownloadLinks([]);
    const id = extractVideoId(inputValue);
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
      const res = await fetch(url, options);
      const data = await res.json();

      if (data && (data.formats || data.adaptiveFormats)) {
        const combinedFormats = [
          ...(data.formats || []),
          ...(data.adaptiveFormats || []),
        ];
        setDownloadLinks(combinedFormats);
      } else {
        setError('No download links found.');
      }
    } catch {
      setError('Error fetching download links.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-r from-purple-900 to-indigo-800 flex flex-col items-center justify-center p-4 relative"
    >
      {/* Lottie Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          >
            <Lottie animationData={loadingAnimation} style={{ width: 150, height: 150 }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white bg-opacity-10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative z-10">
        <h1 className="text-5xl font-extrabold text-white text-center mb-8 tracking-wide">Premium YouTube Downloader</h1>

        {/* Input Field Full width Apple-style */}
        <div className="relative w-full mb-6">
          <input
            type="text"
            id="youtube-url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
            className="peer w-full p-5 rounded-xl bg-white bg-opacity-20 placeholder-transparent text-white focus:outline-none focus:ring-4 focus:ring-purple-500 text-lg"
            placeholder="Paste YouTube URL or ID"
          />
          <label htmlFor="youtube-url" className="absolute left-5 top-4 text-gray-300 text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-purple-300">
            Paste YouTube URL or ID
          </label>
        </div>

        {/* Download Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-xl transition text-xl"
        >
          {loading ? 'Processing...' : 'Get Download Links'}
        </motion.button>

        {/* Video Preview as Fullscreen Popup */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              onClick={() => setActiveVideo(null)}
            >
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}`}
                className="w-full h-full max-w-5xl max-h-[80vh] rounded-xl shadow-xl"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Download Links Display */}
        {downloadLinks.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-white text-center font-semibold text-2xl">Available Formats:</h2>
            {downloadLinks.map((link, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 shadow-lg flex justify-between items-center transition cursor-pointer"
              >
                <div onClick={() => setActiveVideo(videoId)}>
                  <p className="text-white font-semibold">
                    {link.qualityLabel || 'Unknown Quality'}
                  </p>
                  <p className="text-gray-300 text-sm">{link.mimeType?.split(';')[0]}</p>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white py-2 px-4 rounded-xl shadow transition"
                >
                  Download
                </a>
              </motion.div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-400 mt-4 text-center font-semibold text-lg">{error}</p>
        )}
      </div>
    </motion.div>
  );
};

export default App;
