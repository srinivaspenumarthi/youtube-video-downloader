import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import loadingAnimation from './Animation - 1750332876998.json'; // Rename file correctly (no spaces)

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [videoId, setVideoId] = useState('');
  const [downloadLinks, setDownloadLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      className="min-h-screen bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4 relative"
    >
      {/* Lottie Loading Overlay */}
      {loading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-3xl z-50"
        >
          <Lottie animationData={loadingAnimation} style={{ width: 120, height: 120 }} />
        </motion.div>
      )}

      <div className="bg-white bg-opacity-10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <h1 className="text-4xl font-extrabold text-white text-center mb-6 tracking-wide">Premium YouTube Downloader</h1>

        {/* Floating Label Input */}
        <div className="relative w-full mb-4">
          <input
            type="text"
            id="youtube-url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
            className="peer w-full p-4 rounded-xl bg-white bg-opacity-10 placeholder-transparent text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Paste URL"
          />
          <label htmlFor="youtube-url" className="absolute left-4 top-4 text-gray-300 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-[-10px] peer-focus:text-xs peer-focus:text-purple-300">
            Paste YouTube URL or ID
          </label>
        </div>

        {/* Download Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-xl transition duration-300"
        >
          {loading ? 'Processing...' : 'Get Download Links'}
        </motion.button>

        {/* Video Preview */}
        {videoId && !loading && (
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Video Preview"
            className="w-full mt-4 rounded-xl shadow-xl"
          />
        )}

        {/* Download Links as Beautiful Cards */}
        {downloadLinks.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-white text-center font-semibold text-lg">Available Formats:</h2>
            {downloadLinks.map((link, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 shadow-lg flex justify-between items-center transition cursor-pointer"
              >
                <div>
                  <p className="text-white font-semibold">
                    {link.qualityLabel || 'Unknown Quality'}
                  </p>
                  <p className="text-gray-300 text-sm">{link.mimeType?.split(';')[0]}</p>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-2 px-4 rounded-xl shadow transition"
                >
                  Download
                </a>
              </motion.div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 mt-4 text-center font-semibold">{error}</p>
        )}
      </div>
    </motion.div>
  );
};

export default App;
