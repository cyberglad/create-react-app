import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [audio, setAudio] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (token) {
        try {
          const response = await fetch('/api/history', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          setHistory(data);
        } catch (err) {
          console.error('Error fetching history:', err);
        }
      }
    };

    fetchHistory();
  }, [token]);

  const handleUpload = async () => {
    if (!audio) return alert('Please select an audio file.');
    const formData = new FormData();
    formData.append('audio', audio);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload error');
      }

      const data = await response.json();
      setTranscription(data.text);
      setHistory(prev => [data.text, ...prev]);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  if (!token) return <Auth setToken={setToken} />;

  return (
    <div className="App">
      <h1>Audio to Text</h1>
      <input type="file" accept="audio/*" onChange={e => setAudio(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      {transcription && (
        <div className="transcription">
          <h2>Latest Transcription</h2>
          <p>{transcription}</p>
        </div>
      )}

      <h3>Transcription History</h3>
      <ul>
        {history.map((item, idx) => (
          <li key={idx}>{item.text || item}</li>
        ))}
      </ul>
    </div>
  );
}

function Auth({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    const endpoint = isLogin ? '/api/login' : '/api/signup';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Auth failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } catch (err) {
      alert('Auth failed.');
      console.error(err);
    }
  };

  return (
    <div className="auth">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleAuth}>{isLogin ? 'Login' : 'Sign Up'}</button>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer' }}>
        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </p>
    </div>
  );
}

export default App;
