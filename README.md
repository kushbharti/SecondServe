# 🍽️ Second Serve Platform

> A role-based food redistribution system with approval workflows, caching optimization, and real-time donation lifecycle management.

---

# 📖 Description

**Second Serve Platform** is a full-stack system designed to streamline surplus food distribution using structured workflows and system-level optimizations.

Unlike basic donation apps, this platform focuses on:

* **Controlled onboarding** (admin-approved receivers)
* **Efficient data delivery** (Redis-backed caching)
* **Lifecycle-based donation handling** (post → claim → complete)

It ensures that food distribution is **traceable, fast, and reliable**, while minimizing unnecessary database load and unauthorized access.

---

# 🚀 Core Features

* **Multi-role system with restricted receiver access**

  * Separate flows for Donor, NGO, Orphanage, Old Age Home, and Hospital

* **Admin-controlled onboarding pipeline**

  * Receivers remain inactive until verified and approved

* **Dual interaction model**

  * Donor → creates listings/posts
  * Receiver → claims listings OR creates requests

* **State-driven donation lifecycle**

  * Pending → Accepted → Completed / Cancelled

* **Redis-backed selective caching**

  * Frequently accessed endpoints cached with TTL + auto-invalidation

* **Token lifecycle management**

  * Auto-refresh on expiry + blacklist on logout

* **Optimized API interaction layer**

  * Axios interceptor handles retries transparently

---

# 🛠️ Tech Stack

**Backend**

* Django 6
* Django REST Framework
* SimpleJWT

**Frontend**

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS

**Database**

* MySQL

**Caching**

* Redis (`django-redis`)
* Fallback: LocMemCache

**State & API**

* Zustand
* Axios

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

# ▶️ Usage

* Donors publish surplus food or respond to requests
* Receivers (after approval) claim listings or create demand
* System updates status across each stage of the transaction
* Cached endpoints ensure low-latency browsing under load

---

# 🔮 Future Scope

* Real-time notifications (WebSockets)
* Geo-based matching & routing
* AI-based demand prediction
* Mobile application layer
* Impact analytics dashboard

---

# 🤝 Contributing

```bash
git checkout -b feature-name
git commit -m "your changes"
git push origin feature-name
```

---

# 📜 License

MIT License

---

# 👤 Author

Kush Bharti
