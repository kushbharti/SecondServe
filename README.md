# 🍽️ Second Serve Platform

A role-based food redistribution system with approval workflows, caching optimization, and lifecycle-based donation management.

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


# Images

<img width="921" height="476" alt="image" src="https://github.com/user-attachments/assets/ad0bfcec-8828-4637-8b30-885e3acf4e72" />


<img width="697" height="407" alt="image" src="https://github.com/user-attachments/assets/e36c9359-3eb8-4c57-bf1f-85de0b8bcfc6" />


<img width="671" height="371" alt="image" src="https://github.com/user-attachments/assets/3c5a46ea-6510-44dd-a93d-d1ff69f868f4" />


<img width="743" height="417" alt="image" src="https://github.com/user-attachments/assets/fa7ba4b5-d0cf-4215-ad3e-f467a783a7fb" />


<img width="914" height="416" alt="image" src="https://github.com/user-attachments/assets/bee0e02d-9076-4624-9835-9e879965b89e" />


<img width="965" height="556" alt="image" src="https://github.com/user-attachments/assets/01fe062b-a079-4017-a126-4f2a102257f3" />


<img width="670" height="483" alt="image" src="https://github.com/user-attachments/assets/fcc3ab04-aed7-43e6-9f7c-ce369bceec00" />


<img width="813" height="349" alt="image" src="https://github.com/user-attachments/assets/840047c2-4a8a-489b-9083-74120cab0a26" />


<img width="768" height="441" alt="image" src="https://github.com/user-attachments/assets/a7d4d30c-1b67-4f1e-bbed-e1ae9b09997b" />




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
