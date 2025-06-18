
import React, { useState } from 'react';

const App: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');

    try {
      const url = `https://cloud-api-hub-youtube-downloader.p.rapidapi.com/mux?id=${videoId}&quality=720&codec=h264&audioFormat=best&language=en`;
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
    } catch (err) {
      setError('Error fetching download link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>YouTube Downloader</h1>
      <input
        type="text"
        placeholder="Enter YouTube Video ID"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />
      <button onClick={handleDownload} disabled={loading}>
        {loading ? 'Loading...' : 'Get Download Link'}
      </button>
      {downloadUrl && (
        <p>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            Download Video
          </a>
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default App;
