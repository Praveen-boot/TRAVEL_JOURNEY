import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', text: "Hello! I'm **Wayfarer**, your personal travel assistant. Where are we heading next?" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setChat((prev) => [...prev, userMessage]);
    setLoading(true);
    const currentInput = input;
    setInput('');

    try {
      // Ensure your backend is running on port 5000
      const response = await axios.post('http://localhost:5000/api/chat', { 
        message: currentInput 
      });
      
      const botMessage = { role: 'bot', text: response.data.reply };
      setChat((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Connection Error:", error);
      setChat((prev) => [...prev, { 
        role: 'bot', 
        text: "⚠️ Sorry, I'm having trouble connecting to the flight deck. Is the backend server running?" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🌍 Wayfarer AI</h1>
        <p style={styles.subtitle}>Iteration 2: Expert Persona Active</p>
      </header>

      <div style={styles.chatBox}>
        {chat.map((msg, i) => (
          <div 
            key={i} 
            style={{
              ...styles.messageWrapper,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              ...styles.bubble,
              backgroundColor: msg.role === 'user' ? '#007AFF' : '#E9E9EB',
              color: msg.role === 'user' ? 'white' : 'black',
              borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
            }}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.messageWrapper}>
            <div style={{...styles.bubble, backgroundColor: '#E9E9EB'}}>
              <p style={styles.typing}>Wayfarer is checking maps...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputArea}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask about destinations, budgets, or itineraries..."
          style={styles.input}
          disabled={loading}
        />
        <button type="submit" style={styles.button} disabled={loading || !input.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

// Basic styling object to keep the UI clean without needing external CSS files
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f5f5f7'
  },
  header: {
    padding: '20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ddd',
    textAlign: 'center'
  },
  title: { margin: 0, fontSize: '24px', color: '#1d1d1f' },
  subtitle: { margin: '5px 0 0', fontSize: '12px', color: '#86868b', textTransform: 'uppercase' },
  chatBox: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  messageWrapper: {
    display: 'flex',
    width: '100%'
  },
  bubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    fontSize: '15px',
    lineHeight: '1.5',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  inputArea: {
    padding: '20px',
    backgroundColor: '#fff',
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid #ddd'
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '25px',
    border: '1px solid #ccc',
    fontSize: '16px',
    outline: 'none'
  },
  button: {
    padding: '10px 20px',
    borderRadius: '25px',
    border: 'none',
    backgroundColor: '#007AFF',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  typing: {
    margin: 0,
    fontStyle: 'italic',
    fontSize: '13px',
    color: '#86868b'
  }
};

export default App;