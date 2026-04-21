# 🍽️ Second Serve Platform

> A role-based food redistribution system with approval workflows, caching optimization, and lifecycle-based donation management.

---

# 📖 Description

**Second Serve Platform** is a full-stack system designed to streamline surplus food distribution using structured workflows and system-level optimizations.

It focuses on:

- Controlled onboarding (admin-approved receivers)
- Efficient data delivery (Redis-backed caching)
- Lifecycle-based donation handling (post → claim → complete)

---

# 🚀 Core Features

- Multi-role system with restricted receiver access
- Admin-controlled onboarding pipeline
- Dual interaction model (Donor ↔ Receiver)
- State-driven donation lifecycle
- Redis-backed selective caching
- Token lifecycle management (refresh + blacklist)
- Optimized API handling with interceptors

---

# 🛠️ Tech Stack

**Backend**

- Django 6
- Django REST Framework
- SimpleJWT

**Frontend**

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS

**Database**

- MySQL

**Caching**

- Redis (`django-redis`)
- Fallback: LocMemCache

**State & API**

- Zustand
- Axios

---

# 📂 Project Structure

```
Second-Serve-Platform/
├── django_backend/
│   ├── accounts/
│   ├── donors/
│   ├── recipients/
│   ├── backend/
│   └── media/
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── donor/
│   │   ├── recipient/
│   │   └── admin-panel/
│   ├── components/
│   ├── store/
│   ├── lib/
│   └── types/
│
└── env/
```

---

# ⚙️ Installation & Setup

## Backend

```bash
cd e:/Second-Serve-Platform
.\env\Scripts\Activate.ps1

cd django_backend
pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Redis (Optional)

```bash
docker run -d -p 6379:6379 redis:alpine
```

---

# 🔑 Environment Variables Setup

## Backend `.env` (inside `django_backend/`)

```env
# ==============================
# Django Configuration
# ==============================
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# ==============================
# Database (MySQL)
# ==============================
DB_NAME=second_serve_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# ==============================
# Redis (Optional)
# ==============================
REDIS_URL=redis://localhost:6379/0

# ==============================
# CORS
# ==============================
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## Frontend `.env.local` (inside `frontend/`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

# ▶️ Usage

- Donors publish surplus food or fulfill requests
- Receivers (after approval) claim listings or create demand
- System manages status transitions automatically
- Cached endpoints ensure fast response times

---

# 🔮 Future Scope

- Real-time notifications (WebSockets)
- Geo-based matching system
- AI-based demand prediction
- Mobile app integration
- Advanced analytics dashboard

---

# 🤝 Contributing

```bash
git checkout -b feature-name
git commit -m "your changes"
git push origin feature-name
```

---

# 👤 Author

Kush kumar Bharti
