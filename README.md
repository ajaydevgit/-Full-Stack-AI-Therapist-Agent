# 🌿 Serene — Full-Stack AI Therapist Agent

> **#cl-web-therapist** | Built for μLearn Foundation Web Development Challenge

A modern, full-stack AI Therapist Agent web application designed to provide empathetic, 24/7 mental wellness support, active listening, structured session histories, AI-generated coping strategies, and built-in crisis detection with immediate emergency resources.

---

## ✨ Features

- 👤 **User Authentication & Anonymous Sessions**: Register, sign in with JWT, or jump in right away with one-click **"Continue as Guest"** mode.
- 💬 **Empathetic Real-time AI Chat**: Powered by Google Gemini 1.5 Flash with active listening, compassionate responses, and CBT-informed therapeutic guidance.
- 🧘 **Pre-Session Mood Check-in**: Select your current emotional state to help Serene personalize the conversation.
- 📜 **Session History & Review**: Persistent SQLite storage to view past sessions, review conversation transcripts, and track your wellness journey.
- 🧠 **End-of-Session Summaries & Coping Steps**: Automatically generates emotional themes, personalized insights, and 5 actionable coping strategies.
- 🚨 **Crisis Detection & Safety Resources**: Real-time pattern detection for self-harm and crisis language with immediate display of 24/7 emergency helplines.
- 🎨 **Glassmorphic UI & Smooth Animations**: Dark-mode glassmorphism styling built with React, TailwindCSS, Lucide icons, and Framer Motion.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion, Lucide React, React Router 6, React Hot Toast, Axios
- **Backend**: Node.js, Express, SQLite (`better-sqlite3`), JWT, BcryptJS, CORS, Dotenv
- **AI Engine**: Google Gemini API (`@google/generative-ai`) with intelligent fallback

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/) *(optional - mock fallback included)*

### 2. Setup Backend
```bash
cd backend
npm install
```

Create/edit `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=serene_ai_therapist_jwt_secret_key_2026
PORT=5000
NODE_ENV=development
```

Start the backend:
```bash
npm start
```
*Backend runs on `http://localhost:5000`*

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🌐 Deploy to Vercel (1-Click Guide)

### Method 1: Deploy via GitHub + Vercel Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   cd therapist-ai
   git init
   git add .
   git commit -m "feat: full-stack AI therapist agent"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
   - Click **"Add New..."** → **"Project"**.
   - Select your `therapist-ai` repository.

3. **Configure Environment Variables**:
   Under **Environment Variables**, add:
   - `OPENROUTER_API_KEY`: *(Your OpenRouter API Key from [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys))*
   - `OPENROUTER_MODEL`: `google/gemma-4-26b-a4b-it:free`
   - `JWT_SECRET`: `serene_ai_therapist_jwt_secret_key_2026`

4. Click **"Deploy"**!
   - Vercel will automatically build the React frontend and deploy the serverless Express API (`/api/*`).

---

### Method 2: Deploy via Vercel CLI

```bash
cd therapist-ai
npx vercel
```
- Follow the interactive prompts and link to your Vercel account.
- When asked for production, run `npx vercel --prod`.

---

## 📁 Project Structure

```
therapist-ai/
├── backend/
│   ├── auth.js            # JWT verification & token generation
│   ├── crisis.js          # Crisis language patterns & helpline directory
│   ├── db.js              # SQLite schema, tables & queries
│   ├── gemini.js          # Google Gemini AI prompts & summary generator
│   ├── server.js          # Express server with RESTful API routes
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatMessage.jsx     # Message bubbles & typing indicator
│   │   │   ├── CrisisAlert.jsx     # Emergency helpline modal
│   │   │   ├── Navbar.jsx          # Glassmorphism header & navigation
│   │   │   └── SessionSummary.jsx  # Summary, themes & coping steps card
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx     # Auth state management
│   │   ├── pages/
│   │   │   ├── Chat.jsx            # Mood selector & chat interface
│   │   │   ├── Landing.jsx         # Landing page & features showcase
│   │   │   ├── Login.jsx           # Sign in, Sign up & Guest mode
│   │   │   ├── SessionDetail.jsx   # Past session summary & transcript
│   │   │   └── Sessions.jsx        # History of user sessions
│   │   ├── App.jsx                 # Routing & toast setup
│   │   ├── index.css               # Tailwind & custom glassmorphism styles
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🔒 Safety & Disclaimer

Serene is an AI companion created for supportive wellness conversations and is **not** a substitute for licensed medical or psychiatric care. In any emergency or crisis situation, please contact local emergency services or the helplines listed inside the application.
