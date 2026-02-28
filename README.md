# 🤖 DataCoPilot  
### Intelligent Research & Analysis Platform

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)
![Groq](https://img.shields.io/badge/AI-Groq_LPU-orange)
![License](https://img.shields.io/badge/License-MIT-green)

DataCoPilot is a full-stack AI research assistant built for high-speed analysis workflows.  
It combines a **React frontend** with a **FastAPI backend**, powered by **Groq LPU inference**, to deliver lightning-fast research conversations with persistent history and secure authentication.

---

# 🌟 Features

## 🔐 Secure Authentication
- Unified `handleAuth` login/signup logic
- SQLite-based credential storage
- Session persistence across refresh
- Protected dashboard routes

## 💬 Smart Chat System
- Persistent chat history by `user_id`
- Context-aware multi-turn AI conversations
- Delete Chat functionality
- Automatic database initialization (`init_db()`)

## ⚡ High-Speed AI Engine
- Groq LPU-powered responses
- Context memory injection
- Optimized for real-time research workflows

---

# 🏗️ System Architecture

```
Frontend (React)
        ↓
API Requests (REST)
        ↓
Backend (FastAPI)
        ↓
SQLite Database
        ↓
Groq API (LLM Processing)
```

---

# 📂 Project Structure

```
DataCoPilot/
│
├── frontend/
│   ├── App.jsx
│   ├── components/
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── users.db
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

# 🚀 Getting Started

## 🔧 Backend Setup

### 1️⃣ Navigate to backend
```bash
cd backend
```

### 2️⃣ Create virtual environment
```bash
python -m venv .venv
```

### 3️⃣ Activate environment

**Windows (PowerShell):**
```bash
.venv\Scripts\activate
```

**Mac/Linux:**
```bash
source .venv/bin/activate
```

### 4️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 5️⃣ Create `.env` file
Inside `/backend`, create:

```
GROQ_API_KEY=your_groq_api_key_here
```

### 6️⃣ Run backend server
```bash
python main.py
```

---

## 🎨 Frontend Setup

### 1️⃣ Navigate to frontend
```bash
cd ../frontend
```

### 2️⃣ Install packages
```bash
npm install
```

### 3️⃣ Start development server
```bash
npm run dev
```

---

# 🌍 Environment Variables

| Variable | Description |
|----------|-------------|
| GROQ_API_KEY | Your Groq API key for LLM responses |

---

# 📡 API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Authenticate user |
| POST | `/chat` | Send message to AI |
| DELETE | `/delete-history/{user_id}` | Clear chat history |

---

# 🚀 Deployment Guide

## Backend (Render)
1. Connect GitHub repo to Render
2. Add environment variable `GROQ_API_KEY`
3. Set build command:
```
pip install -r requirements.txt
```
4. Set start command:
```
python main.py
```

## Frontend (Vercel)
1. Import GitHub repository
2. Select `frontend` folder
3. Deploy

---

# 🔒 Security

- GitHub Push Protection enabled
- Secrets stored in environment variables
- No API keys committed
- Isolated SQLite storage per deployment

---

# 📜 License

This project is licensed under the MIT License.

---

# 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

DM: asamlaxmipriya@gmail.com

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
