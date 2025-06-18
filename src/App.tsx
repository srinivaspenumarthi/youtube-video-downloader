import React, { useState } from 'react';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [videoId, setVideoId] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('720');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractVideoId = (urlOrId: string) => {
    const regex = /(?:youtube\\.com.*[?&]v=|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/;
    const match = urlOrId.match(regex);
    return match ? match[1] : urlOrId;
  };

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    const id = extractVideoId(inputValue);
    setVideoId(id);

    try {
      const url = `https://cloud-api-hub-youtube-downloader.p.rapidapi.com/mux?id=${id}&quality=${selectedQuality}&codec=h264&audioFormat=best&language=en`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'cloud-api-hub-youtube-downloader.p.rapidapi.com',
          'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY as string,
        },
      };
      const res = await fetch(url, options);
      const data = await res.json();

      if (data.url) setDownloadUrl(data.url);
      else setError('Download URL not found.');
    } catch {
      setError('Error fetching download link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Premium YouTube Downloader</h1>
        <input
          type="text"
          placeholder="Paste YouTube URL or ID"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-3 rounded bg-white bg-opacity-20 placeholder-gray-300 text-white mb-4 focus:outline-none"
        />
        <select
          value={selectedQuality}
          onChange={(e) => setSelectedQuality(e.target.value)}
          className="w-full p-3 rounded bg-white bg-opacity-20 text-white mb-4 focus:outline-none"
        >
          {['144','240','360','480','720','1080'].map(q => (
            <option key={q} value={q}>{q}p</option>
          ))}
        </select>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition duration-300"
        >
          {loading ? 'Processing...' : 'Get Download Link'}
        </button>
        {videoId && (
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Video Preview"
            className="w-full mt-4 rounded shadow-lg"
          />
        )}
        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-center text-green-300 underline"
          >
            Download Video
          </a>
        )}
        {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
      </div>
    </motion.div>
  );
};

export default App;
