import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

// --- ICONS ---
const IconChat = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
const IconFile = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconUpload = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
const IconBrain = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
const IconTrash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [history, setHistory] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const messagesEndRef = useRef(null)
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const loginRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) 
  }, [messages])

  useEffect(() => { if (isLoggedIn) fetchHistory() }, [isLoggedIn])

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/history/${username}`)
      setHistory(res.data)
    } catch (err) { console.error("History fetch failed") }
  }

  // --- FIXED AUTH: ONLY ONE DECLARATION ---
  const handleAuth = async (endpoint) => {
    try {
      const payload = { username: username.trim(), password: password.trim() };
      await axios.post(`http://127.0.0.1:8000/${endpoint}`, payload);
      if (endpoint === 'login') setIsLoggedIn(true)
      else alert("Account created! Please Sign In.")
    } catch (err) { 
      console.error(err.response?.data);
      alert(err.response?.data?.detail || "Auth failed.");
    }
  }

  // --- NEW: DELETE CHAT LOGIC ---
  const deleteChat = async () => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    if (window.confirm("Delete this research session?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/delete_chat/${activeChatId}`);
        setMessages([]);
        setActiveChatId(null);
        fetchHistory();
      } catch (err) {
        alert("Session deleted from view.");
        setMessages([]);
        setActiveChatId(null);
      }
    }
  }

  const handleSearch = async () => {
    if (!input || loading) return
    const currentInput = input
    setMessages(prev => [...prev, { role: 'user', text: currentInput }])
    setInput(""); setLoading(true)
    try {
      const res = await axios.post('http://127.0.0.1:8000/chat', { 
        username, message: currentInput, chat_id: activeChatId, model: "llama-3.3-70b-versatile" 
      })
      setMessages(prev => [...prev, { role: 'ai', text: res.data.response }])
      setActiveChatId(res.data.chat_id)
      fetchHistory()
    } catch (err) { alert("Error generating response.") }
    setLoading(false)
  }

  const loadChat = (chatObj) => {
    setActiveChatId(chatObj.id);
    setMessages([
      { role: 'user', text: chatObj.question || "" },
      { role: 'ai', text: chatObj.answer || "" }
    ]);
  }

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' })

  if (showSplash) return (
    <div style={styles.splashContainer}><div className="splash-logo-only">🧬</div></div>
  )

  if (!isLoggedIn) return (
    <div style={styles.pageWrapper}>
      <nav style={styles.navbar}>
        <div style={styles.logo}>🧬 DataCoPilot</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => scrollTo(featuresRef)} style={styles.navLink}>Features</button>
          <button onClick={() => scrollTo(howItWorksRef)} style={styles.navLink}>How it Works</button>
          <button onClick={() => scrollTo(loginRef)} style={styles.loginNavBtn}>Login</button>
        </div>
      </nav>

      <section style={styles.hero}>
        <div className="glow-badge">✨ Powered by AI</div>
        <h1 className="hero-title">Your Autonomous AI<br/>Research Partner</h1>
        
        <div ref={loginRef} style={styles.authBox}>
          <div style={styles.inputGroup}>
            <input style={styles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" style={styles.input} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="neon-btn" style={styles.mainBtn} onClick={() => handleAuth('login')}>Sign In</button>
          </div>
          <button style={styles.secondaryBtn} onClick={() => handleAuth('signup')}>Create New Account</button>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section ref={howItWorksRef} style={{...styles.featureSection, background: '#0b1120'}}>
        <h2 style={{textAlign:'center', marginBottom: '50px', fontSize: '32px'}}>How It Works</h2>
        <div style={styles.grid}>
          <div style={styles.stepCard}><div style={styles.stepNum}>1</div><h3>Upload Data</h3><p>Securely upload your research papers.</p></div>
          <div style={styles.stepCard}><div style={styles.stepNum}>2</div><h3>AI Analysis</h3><p>Our model indexes your information.</p></div>
          <div style={styles.stepCard}><div style={styles.stepNum}>3</div><h3>Get Insights</h3><p>Receive data-driven answers.</p></div>
        </div>
      </section>

      <section ref={featuresRef} style={styles.featureSection}>
        <h2 style={{textAlign:'center', marginBottom: '50px', fontSize: '32px'}}>Powerful Features</h2>
        <div style={styles.grid}>
          <div className="feature-card" style={styles.featureCard}><div style={styles.iconCircle}><IconChat/></div><h3>AI Research Chat</h3><p>Engage in dialogues with AI.</p></div>
          <div className="feature-card" style={styles.featureCard}><div style={styles.iconCircle}><IconFile/></div><h3>Smart Summaries</h3><p>PDF context-aware summaries.</p></div>
          <div className="feature-card" style={styles.featureCard}><div style={styles.iconCircle}><IconBrain/></div><h3>Deep Context</h3><p>Cross-paper insights.</p></div>
        </div>
      </section>

      <footer style={styles.footer}>🧬 DataCoPilot © 2026</footer>
      <style>{`
        @keyframes popIcon { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.8); opacity: 0; } }
        .splash-logo-only { font-size: 80px; animation: popIcon 2.2s ease-in-out forwards; }
        .hero-title { font-size: 64px; font-weight: 800; background: linear-gradient(to right, #6366f1, #d946ef); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .glow-badge { background: #1e1b4b; color: #818cf8; padding: 6px 16px; border-radius: 20px; border: 1px solid #312e81; margin-bottom: 20px; display: inline-block; }
      `}</style>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#020617', color: '#fff' }}>
      <div style={styles.sidebar}>
        <h3 style={{color: '#6366f1', marginBottom: '20px'}}>DataCoPilot</h3>
        <button onClick={() => {setMessages([]); setActiveChatId(null)}} style={styles.newBtn}>+ New Research</button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {history.map((h, index) => (
            <div key={h.id || index} onClick={() => loadChat(h)} 
                 style={{...styles.historyItem, backgroundColor: activeChatId === h.id ? '#1e293b' : 'transparent'}}>
              <span style={{fontSize:'13px'}}>{h.title || "Untitled Research"}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setIsLoggedIn(false)} style={styles.logoutBtn}>Sign Out</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0b1120' }}>
        <header style={styles.chatHeader}>
          <span>Researcher: <strong>{username}</strong></span>
          {/* UPDATED: DELETE BUTTON */}
          <button onClick={deleteChat} style={styles.deleteBtn}><IconTrash /> Delete Chat</button>
        </header>

        <div style={styles.chatWindow}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
              <div style={m.role === 'user' ? styles.userBubble : styles.aiBubble}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputArea}>
          <div style={styles.inputWrapper}>
            <label style={{ padding: '0 15px', cursor: 'pointer' }}><IconUpload /><input type="file" style={{display:'none'}}/></label>
            <input style={styles.chatInput} value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} placeholder="Ask anything..."/>
            <button style={styles.sendBtn} onClick={handleSearch}>Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  splashContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  pageWrapper: { backgroundColor: '#020617', color: '#f8fafc', scrollBehavior: 'smooth' },
  navbar: { display: 'flex', justifyContent: 'space-between', padding: '20px 80px', position: 'sticky', top: 0, background: '#020617', borderBottom: '1px solid #1e293b', zIndex: 10 },
  logo: { fontWeight: '800', fontSize: '24px', color: '#6366f1' },
  navLink: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  loginNavBtn: { padding: '8px 20px', borderRadius: '10px', border: '1px solid #334155', color: '#fff', background: 'transparent' },
  hero: { padding: '100px 20px', textAlign: 'center' },
  authBox: { background: '#0f172a', padding: '40px', borderRadius: '32px', width: '400px', margin: '40px auto', border: '1px solid #1e293b' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '16px' },
  input: { padding: '16px', borderRadius: '14px', border: '1px solid #334155', background: '#020617', color: '#fff', boxSizing: 'border-box', outline: 'none' },
  mainBtn: { padding: '16px', borderRadius: '14px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 'bold' },
  secondaryBtn: { background: 'none', border: 'none', color: '#6366f1', marginTop: '10px' },
  featureSection: { padding: '100px 80px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
  stepCard: { textAlign: 'center', padding: '20px' },
  stepNum: { width: '40px', height: '40px', background: '#6366f1', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  featureCard: { background: '#0f172a', padding: '30px', borderRadius: '24px', border: '1px solid #1e293b', transition: '0.3s', textAlign: 'left' },
  iconCircle: { width: '48px', height: '48px', borderRadius: '12px', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  footer: { padding: '40px', textAlign: 'center', borderTop: '1px solid #1e293b', color: '#64748b' },
  sidebar: { width: '280px', background: '#020617', padding: '20px', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column' },
  newBtn: { background: '#1e293b', color: '#fff', padding: '12px', borderRadius: '12px', border: 'none', marginBottom: '20px', cursor: 'pointer' },
  historyItem: { padding: '12px', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer' },
  logoutBtn: { border: '1px solid #1e293b', color: '#64748b', background: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' },
  chatHeader: { padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' },
  
  // UPDATED: DELETE BTN STYLE
  deleteBtn: { background: '#1e293b', color: '#f87171', border: '1px solid #450a0a', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  
  chatWindow: { flex: 1, overflowY: 'auto', padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: '15px' },
  userBubble: { display: 'inline-block', background: '#6366f1', padding: '12px 18px', borderRadius: '18px 18px 0 18px', maxWidth: '70%', wordBreak: 'break-word' },
  aiBubble: { display: 'inline-block', background: '#1e293b', padding: '12px 18px', borderRadius: '18px 18px 18px 0', maxWidth: '80%', border: '1px solid #334155', wordBreak: 'break-word' },
  inputArea: { padding: '20px 40px' },
  inputWrapper: { display: 'flex', background: '#0f172a', padding: '8px', borderRadius: '20px', border: '1px solid #334155' },
  chatInput: { flex: 1, background: 'none', border: 'none', color: '#fff', padding: '10px', outline: 'none' },
  sendBtn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', padding: '0 25px', cursor: 'pointer' }
}

export default App