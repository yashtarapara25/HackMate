# HackMate AI — Backend API Service

FastAPI backend application for **HackMate AI** connected to **Neon PostgreSQL**.

---

## 🛠️ Tech Stack
- **Framework**: FastAPI (Python 3.10+)
- **ORM / Database**: SQLAlchemy + Neon PostgreSQL
- **Server**: Uvicorn / Gunicorn
- **Auth**: JWT Authentication (`PyJWT`, `passlib[bcrypt]`)

---

## ⚙️ Local Development Setup

1. **Activate Virtual Environment & Install Dependencies**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and update credentials:
   ```bash
   cp .env.example .env
   ```

3. **Start Development Server**:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

4. **Access Swagger Documentation**:
   Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.

---

## 🚀 Deploying to Render (Python Web Service)

1. Create a **New Web Service** on [Render.com](https://render.com).
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -k uvicorn.workers.UvicornWorker main:app`
4. Add Environment Variables on Render dashboard:
   - `DATABASE_URL` (Your Neon DB PostgreSQL string)
   - `SECRET_KEY` (Your JWT secret)
   - `ALGORITHM` (`HS256`)
   - `ADMIN_EMAIL` (`admin@hackmate.ai`)
   - `ADMIN_PASSWORD` (`YourSecurePassword`)
