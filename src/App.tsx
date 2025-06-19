import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import loadingAnimation from './Animation - 1750332876998.json'; // Rename file without spaces for safety

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
          'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY as string, // Or your real key here
        },
      };
      const res = await fetch(url, options);
      const data = await res.json();

      if (data && data.formats) {
        setDownloadLinks(data.formats);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-r from-purple-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-white text-center mb-6 tracking-wide">Premium YouTube Downloader</h1>
        <input
          type="text"
          placeholder="Paste YouTube URL or ID"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-4 rounded-xl bg-white bg-opacity-20 placeholder-gray-300 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg transition duration-300"
        >
          {loading ? 'Processing...' : 'Get Download Links'}
        </button>

        {loading && <div className="flex justify-center mt-4"><Lottie animationData={loadingAnimation} style={{ width: 100, height: 100 }} /></div>}

        {videoId && !loading && (
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Video Preview"
            className="w-full mt-4 rounded-xl shadow-xl"
          />
        )}

        {downloadLinks.length > 0 && (
          <div className="mt-4">
            <h2 className="text-white text-center mb-2 font-semibold">Available Formats:</h2>
            {downloadLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-500 hover:bg-green-600 text-white text-center py-2 px-4 rounded-xl mb-2 transition"
              >
                {link.qualityLabel || 'Unknown Quality'} ({link.mimeType})
              </a>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 mt-2 text-center font-semibold">{error}</p>}
      </div>
    </motion.div>
  );
};

export default App;
