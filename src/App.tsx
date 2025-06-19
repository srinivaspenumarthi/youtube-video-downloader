import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import loadingAnimation from './Animation-1750332876998.json'; // Ensure correct filename without spaces

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [videoId, setVideoId] = useState('');
  const [downloadLinks, setDownloadLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

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
      className="min-h-screen w-full bg-gradient-to-tr from-gray-900 via-purple-900 to-black flex flex-col md:flex-row p-2 md:p-8 gap-4"
    >
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <Lottie animationData={loadingAnimation} style={{ width: 200, height: 200 }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-6 w-full md:w-1/2 flex flex-col justify-center">
        <h1 className="text-4xl font-extrabold text-white text-center mb-6">Pro YouTube Downloader</h1>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-500 text-lg mb-4"
          placeholder="Paste YouTube URL or ID here"
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 text-white rounded-xl font-bold shadow-xl transition text-xl mb-4"
        >
          {loading ? 'Fetching...' : 'Fetch Download Links'}
        </motion.button>

        {downloadLinks.length > 0 && (
          <div className="mt-4 space-y-3 overflow-y-auto max-h-96">
            <h2 className="text-white text-center font-semibold text-xl">Select Format to Preview:</h2>
            {downloadLinks.map((link, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveVideoUrl(link.url)}
                className="bg-white/10 p-3 rounded-xl text-white cursor-pointer flex justify-between items-center hover:bg-white/20"
              >
                <span>{link.qualityLabel || 'Unknown Quality'}</span>
                <span className="text-sm">{link.mimeType?.split(';')[0]}</span>
              </motion.div>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 mt-4 text-center font-semibold text-lg">{error}</p>}
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-start p-2 md:p-4">
        {videoId && !activeVideoUrl && (
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Video Thumbnail"
            className="w-full rounded-xl shadow-lg"
          />
        )}

        {activeVideoUrl && (
          <iframe
            src={activeVideoUrl}
            className="w-full h-[50vh] md:h-[70vh] rounded-xl shadow-xl mt-4"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        )}
      </div>
    </motion.div>
  );
};

export default App;
