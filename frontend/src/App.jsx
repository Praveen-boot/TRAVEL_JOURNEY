import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// --- SUB-COMPONENT: ITINERARY CARD ---
// This renders only when Gemini sends structured JSON data
const ItineraryCard = ({ data }) => {
  if (!data) return null;
  
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={{ fontSize: '24px' }}>📍</span>
        <h2 style={styles.cardTitle}>{data.destination}</h2>
      </div>
      
      {data.days && data.days.map((day, idx) => (
        <div key={idx} style={styles.daySection}>
          <div style={styles.dayBadge}>Day {day.dayNumber}</div>
          <p style={styles.dayTheme}>{day.theme}</p>
          <ul style={styles.activityList}>
            {day.activities.map((act, i) => (
              <li key={i} style={styles.activityItem}>{act}</li>
            ))}
          </ul>
        </div>
      ))}

      {data.estimatedBudget && (
        <div style={styles.budgetFooter}>
          <span>💰 Est. Budget:</span>
          <span>{data.estimatedBudget}</span>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', text: "Welcome back! I'm **Wayfarer**. I can now generate structured itineraries for you. Where to?" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

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

    // Format history for Gemini API
    const historyContext = chat
      .filter((_, index) => index !== 0) 
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    try {
      const response = await axios.post('http://localhost:5000/api/chat', { 
        message: currentInput,
        history: historyContext 
      });
      
      // We expect the backend to return { reply: "text", data: {json} }
      const botMessage = { 
        role: 'bot', 
        text: response.data.reply,
        structuredData: response.data.data 
      };
      
      setChat((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("API Error:", error);
      setChat((prev) => [...prev, { role: 'bot', text: "⚠️ Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🌍 Wayfarer AI</h1>
        <p style={styles.subtitle}>Iteration 4: Structured Itineraries</p>
      </header>

      <div style={styles.chatBox}>
        {chat.map((msg, i) => (
          <div key={i} style={{
            ...styles.messageWrapper,
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              ...styles.bubble,
              backgroundColor: msg.role === 'user' ? '#007AFF' : '#fff',
              color: msg.role === 'user' ? 'white' : '#1d1d1f',
              border: msg.role === 'user' ? 'none' : '1px solid #e5e5e5',
              borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '2px 18px 18px 18px',
            }}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
              
              {/* Iteration 4 Feature: Show the Card inside the message bubble if data exists */}
              {msg.structuredData && <ItineraryCard data={msg.structuredData} />}
            </div>
          </div>
        ))}
        {loading && <p style={styles.typing}>Wayfarer is planning...</p>}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputArea}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Try: 'Plan a 2 day trip to Rome'"
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f4f7f6', fontFamily: 'system-ui, sans-serif' },
  header: { padding: '15px', backgroundColor: '#fff', borderBottom: '1px solid #eee', textAlign: 'center' },
  title: { margin: 0, fontSize: '22px' },
  subtitle: { margin: 0, fontSize: '10px', color: '#007AFF', fontWeight: 'bold' },
  chatBox: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  messageWrapper: { display: 'flex', width: '100%' },
  bubble: { maxWidth: '85%', padding: '12px 16px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  inputArea: { padding: '20px', backgroundColor: '#fff', display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' },
  button: { padding: '0 20px', borderRadius: '20px', border: 'none', backgroundColor: '#007AFF', color: 'white', cursor: 'pointer' },
  typing: { textAlign: 'center', fontSize: '12px', color: '#888' },
  
  // Card Styles
  card: { backgroundColor: '#fdfdfd', borderLeft: '5px solid #007AFF', borderRadius: '8px', padding: '15px', marginTop: '15px', color: '#333', textAlign: 'left' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  cardTitle: { margin: 0, fontSize: '18px', color: '#007AFF' },
  daySection: { marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' },
  dayBadge: { backgroundColor: '#007AFF', color: '#fff', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  dayTheme: { margin: '5px 0', fontWeight: 'bold', fontSize: '14px' },
  activityList: { margin: '5px 0', paddingLeft: '18px', fontSize: '13px' },
  activityItem: { marginBottom: '3px' },
  budgetFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '13px', fontWeight: 'bold', color: '#444' }
};

export default App;