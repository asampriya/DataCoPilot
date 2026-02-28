import os
import sqlite3
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import fitz  # PyMuPDF

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_KEY) if GROQ_KEY else None

def init_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # Ensure tables exist to avoid "no such table" errors
    cursor.execute("CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, title TEXT, question TEXT, answer TEXT)")
    conn.commit()
    conn.close()

init_db()

class UserAuth(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    username: str
    message: str
    model: str = "llama-3.3-70b-versatile"
    chat_id: Optional[int] = None

@app.post("/signup")
async def signup(user: UserAuth):
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users VALUES (?, ?)", (user.username, user.password))
        conn.commit()
        return {"message": "Success"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="User already exists")
    finally:
        conn.close()

@app.post("/login")
async def login(user: UserAuth):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=? AND password=?", (user.username, user.password))
    result = cursor.fetchone()
    conn.close()
    if result: return {"message": "Logged in"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/chat")
async def chat(req: ChatRequest):
    if not client: raise HTTPException(status_code=500, detail="API Key missing")
    try:
        completion = client.chat.completions.create(
            model=req.model,
            messages=[{"role": "user", "content": req.message}],
            temperature=0.7,
        )
        ai_response = completion.choices[0].message.content

        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        
        if req.chat_id:
            cursor.execute("UPDATE history SET answer = answer || ? WHERE id = ?", 
                           (f"\n\nQ: {req.message}\nA: {ai_response}", req.chat_id))
            final_id = req.chat_id
        else:
            title_gen = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": f"Summarize this into a 3-word title: {req.message}"}],
                max_tokens=15
            )
            short_title = title_gen.choices[0].message.content.strip().replace('"', '')
            
            cursor.execute("INSERT INTO history (username, title, question, answer) VALUES (?, ?, ?, ?)", 
                           (req.username, short_title, req.message, ai_response))
            final_id = cursor.lastrowid
        
        conn.commit()
        conn.close()
        return {"response": ai_response, "chat_id": final_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{username}")
async def get_history(username: str):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, question, answer FROM history WHERE username=?", (username,))
    rows = cursor.fetchall()
    conn.close()
    # Map 'answer' to 'answer' so frontend loadChat() works
    return [{"id": r[0], "title": r[1], "question": r[2], "answer": r[3]} for r in rows]

# --- UPDATED DELETE ENDPOINT ---
@app.delete("/delete_chat/{chat_id}")
async def delete_single_thread(chat_id: int):
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("DELETE FROM history WHERE id=?", (chat_id,))
        conn.commit()
        conn.close()
        return {"message": "Thread deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-pdf/{username}")
async def upload_pdf(username: str, file: UploadFile = File(...)):
    try:
        contents = await file.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        text = "".join([page.get_text() for page in doc])
            
        summary_prompt = f"Summarize this research paper: {text[:2000]}"
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": summary_prompt}],
        )
        ai_summary = completion.choices[0].message.content

        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO history (username, title, question, answer) VALUES (?, ?, ?, ?)", 
                       (username, file.filename, f"Uploaded: {file.filename}", ai_summary))
        final_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return {"response": ai_summary, "chat_id": final_id, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))