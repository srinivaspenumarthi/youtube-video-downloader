import React, { useState } from 'react';

const App: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [quality, setQuality] = useState('720'); // Default 720p
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    setDownloadUrl('');

    if (!videoId.trim()) {
      setError('Please enter a valid YouTube Video ID.');
      setLoading(false);
      return;
    }

    try {
      const url = `https://cloud-api-hub-youtube-downloader.p.rapidapi.com/mux?id=${videoId}&quality=${quality}&codec=h264&audioFormat=best&language=en`;
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

  const renderThumbnail = () => {
    if (!videoId) return null;
    return (
      <img
        src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
        alt="Video Thumbnail"
        style={{ width: '100%', borderRadius: 8, marginBottom: 10 }}
      />
    );
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ background: '#fff', padding: 30, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '90%', maxWidth: 400, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, marginBottom: 15, color: '#111' }}>🎬 YouTube Video Downloader</h1>

        <input
          type="text"
          placeholder="Enter YouTube Video ID"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 15px',
            borderRadius: 8,
            border: '1px solid #ddd',
            marginBottom: 12,
            fontSize: 14
          }}
        />

        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            marginBottom: 12,
            fontSize: 14
          }}
        >
          <option value="144">144p</option>
          <option value="240">240p</option>
          <option value="360">360p</option>
          <option value="480">480p</option>
          <option value="720">720p</option>
          <option value="1080">1080p</option>
        </select>

        {renderThumbnail()}

        <button
          onClick={handleDownload}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 0',
            background: loading ? '#9ca3af' : '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 15,
            fontWeight: 600,
            transition: 'background 0.3s'
          }}
        >
          {loading ? 'Fetching Link...' : 'Get Download Link'}
        </button>

        {downloadUrl && (
          <div style={{ marginTop: 20 }}>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563EB', fontWeight: 600, display: 'block', marginBottom: 10 }}
            >
              🔗 Download Video
            </a>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none' }}
            >
              ▶️ Watch on YouTube
            </a>
          </div>
        )}

        {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
};

export default App;
