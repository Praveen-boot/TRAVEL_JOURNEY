import { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setChat([...chat, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', { message: input });
      const botMessage = { role: 'bot', text: response.data.reply };
      setChat((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error connecting to backend", error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Travel Assistant</h1>
      <div style={{ border: '1px solid #ccc', height: '400px', overflowY: 'scroll', marginBottom: '10px', padding: '10px' }}>
        {chat.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <p><strong>{msg.role === 'user' ? 'You' : 'Gemini'}:</strong> {msg.text}</p>
          </div>
        ))}
        {loading && <p>Thinking...</p>}
      </div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Where should I go in July?"
        style={{ width: '80%' }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default App;