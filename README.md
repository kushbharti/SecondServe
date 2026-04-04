# 🍽️ Second Serve Platform

**A food donation platform connecting individual donors with NGOs, Orphanages, Old Age Homes, and Government Hospitals.**

---

## 📖 Project Overview

Second Serve is a full-stack web platform that bridges the gap between food donors and recipients. Donors can post surplus food listings; approved receiver organizations can browse, claim, and manage food donations and requests. An admin panel manages receiver verification.

---

## ✨ Features

| Feature                    | Description                                                                 |
| -------------------------- | --------------------------------------------------------------------------- |
| **Role-based Auth**        | DONOR role + 4 receiver types (NGO, Orphanage, Old Age Home, Govt Hospital) |
| **JWT Authentication**     | Access + refresh tokens, auto-refresh on 401, blacklist on logout           |
| **Receiver Approval Flow** | Receivers are pending until an admin approves them                          |
| **Food Listings**          | Donors post surplus food; receivers browse and claim                        |
| **Food Requests**          | Receivers post food needs; donors accept and fulfill                        |
| **Redis Caching**          | Profile, food posts, listings cached with auto-invalidation                 |
| **Show/Hide Password**     | Eye icon toggle on login and register pages                                 |
| **Personalized Dashboard** | User name displayed dynamically from backend                                |
| **Admin Panel**            | Approve/reject receivers, view all users, posts, requests                   |

---

## 🛠 Tech Stack

| Layer                | Technology                                            |
| -------------------- | ----------------------------------------------------- |
| **Backend**          | Django 6, Django REST Framework, SimpleJWT            |
| **Database**         | MySQL                                                 |
| **Cache**            | Redis (via `django-redis`), falls back to LocMemCache |
| **Frontend**         | Next.js 15 (App Router), TypeScript, Tailwind CSS     |
| **State Management** | Zustand                                               |
| **HTTP Client**      | Axios                                                 |
| **Icons**            | Lucide React                                          |

---

## 🏗 Project Structure

```
Second-Serve-Platform/
├── django_backend/
│   ├── accounts/          # User model, auth, serializers, admin views
│   ├── donors/            # FoodListing & FoodPost models/views
│   ├── recipients/        # FoodRequest model/views
│   ├── backend/           # Django settings, URLs, cache service, exception handler
│   ├── media/             # Uploaded images
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── (auth)/        # Login, Register pages
│   │   ├── donor/         # Donor dashboard, listings, requests
│   │   ├── recipient/     # Recipient dashboard, browse, claims
│   │   └── admin-panel/   # Admin interface
│   ├── components/        # Shared UI components
│   ├── store/             # Zustand auth store
│   ├── lib/               # API client, donor/recipient helpers
│   └── types/             # TypeScript interfaces
└── env/                   # Python virtual environment
```

---

## 🚀 How to Run

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL running locally
- Redis (optional, falls back to in-memory cache)

---

### Backend Setup

```bash
# 1. Activate virtual environment
cd e:/Second-Serve-Platform
.\env\Scripts\Activate.ps1        # Windows PowerShell
# OR
source env/bin/activate           # Linux/macOS

# 2. Install dependencies
cd django_backend
pip install -r requirements.txt

# 3. Create .env file (see example below)

# 4. Run migrations
python manage.py migrate

# 5. Create superuser (admin)
python manage.py createsuperuser

# 6. Start backend
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local (see example below)

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

### Redis Setup (Optional but Recommended)

**Windows** — Using Redis via WSL or Docker:

```bash
# Docker (easiest)
docker run -d -p 6379:6379 redis:alpine

# Or install Redis for Windows from: https://github.com/microsoftarchive/redis
```

**Verify Redis is running:**

```bash
redis-cli ping
# Expected: PONG
```

**Set in `.env`:**

```
REDIS_URL=redis://localhost:6379/0
```

If `REDIS_URL` is empty or Redis is unavailable, the app automatically falls back to Django's in-memory cache — no downtime.

---

## 🔑 Environment Variables

### Backend `.env` (in `django_backend/`)

```env
# Security
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=second_serve_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend `.env.local` (in `frontend/`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 📡 API Endpoints

### Authentication

| Method  | Endpoint                   | Auth Required | Description                           |
| ------- | -------------------------- | ------------- | ------------------------------------- |
| `POST`  | `/api/auth/register/`      | ❌            | Register a new user                   |
| `POST`  | `/api/auth/login/`         | ❌            | Login and receive JWT tokens          |
| `POST`  | `/api/auth/logout/`        | ✅            | Blacklist the refresh token           |
| `POST`  | `/api/auth/token/refresh/` | ❌            | Get new access token                  |
| `GET`   | `/api/auth/profile/`       | ✅            | Get logged-in user's profile (cached) |
| `PATCH` | `/api/auth/profile/`       | ✅            | Update profile (invalidates cache)    |

#### Register — Request Body (Donor)

```json
{
  "role": "DONOR",
  "email": "donor@example.com",
  "password": "Secure@123",
  "password_confirm": "Secure@123",
  "username": "John",
  "phone_number": "9876543210",
  "address_line1": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

#### Register — Request Body (NGO)

```json
{
  "role": "NGO",
  "email": "ngo@example.com",
  "password": "Secure@123",
  "password_confirm": "Secure@123",
  "organization_name": "Feed India NGO",
  "contact_person": "Priya Sharma",
  "phone_number": "9876543210",
  "registration_number": "REG123456",
  "registration_type": "Trust",
  "pan_number": "ABCDE1234F",
  "registration_certificate_url": "https://example.com/cert.pdf",
  "capacity_people_served": 500,
  "address_line1": "45 NGO Lane",
  "city": "Delhi",
  "district": "Central Delhi",
  "state": "Delhi",
  "pincode": "110001"
}
```

#### Login — Request Body

```json
{
  "email": "donor@example.com",
  "password": "Secure@123",
  "role": "DONOR"
}
```

For **NGO** login, also send `"registration_number": "REG123456"`.  
For **Orphanage** login, also send `"cci_registration_number": "CCI12345"`.  
For **Hospital** login, also send `"hospital_registration_number": "HOSP123"` and `"official_email"`.

#### Login — Response

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access": "<jwt_access_token>",
    "refresh": "<jwt_refresh_token>",
    "role": "DONOR",
    "user": { "id": "...", "email": "...", "username": "John", ... }
  }
}
```

---

### Donor Endpoints

| Method   | Endpoint                           | Auth     | Description                 |
| -------- | ---------------------------------- | -------- | --------------------------- |
| `GET`    | `/api/donor/listings/`             | ✅ DONOR | Get my listings             |
| `POST`   | `/api/donor/listings/`             | ✅ DONOR | Create a food listing       |
| `PATCH`  | `/api/donor/listings/<id>/status/` | ✅ DONOR | Update listing status       |
| `GET`    | `/api/donor/posts/`                | ✅ DONOR | Get my food posts           |
| `POST`   | `/api/donor/posts/`                | ✅ DONOR | Create a food post          |
| `PATCH`  | `/api/donor/posts/<id>/`           | ✅ DONOR | Update food post            |
| `DELETE` | `/api/donor/posts/<id>/`           | ✅ DONOR | Delete food post            |
| `GET`    | `/api/donor/available-requests/`   | ✅ DONOR | See open receiver requests  |
| `POST`   | `/api/donor/accept-request/<id>/`  | ✅ DONOR | Accept a receiver's request |

#### Create Food Post — Request Body

```json
{
  "food_name": "Rice and Dal",
  "quantity": "50 kg",
  "food_type": "veg",
  "servings": 200,
  "expiry_time": "2026-03-23T18:00:00Z",
  "pickup_address": "123 Main St, Mumbai",
  "city": "Mumbai",
  "description": "Freshly cooked, available for pickup before 6 PM"
}
```

---

### Recipient Endpoints

| Method  | Endpoint                                | Auth        | Description                         |
| ------- | --------------------------------------- | ----------- | ----------------------------------- |
| `GET`   | `/api/recipient/available-listings/`    | ✅ Receiver | Browse available donations (cached) |
| `POST`  | `/api/recipient/request/<id>/`          | ✅ Receiver | Claim a donation                    |
| `PATCH` | `/api/recipient/request/<id>/cancel/`   | ✅ Receiver | Cancel a claim                      |
| `POST`  | `/api/recipient/request/<id>/complete/` | ✅ Receiver | Mark donation as completed          |
| `GET`   | `/api/recipient/my-requests/`           | ✅ Receiver | My accepted donations               |
| `GET`   | `/api/recipient/food-requests/`         | ✅ Receiver | My food requests                    |
| `POST`  | `/api/recipient/food-requests/`         | ✅ Receiver | Create a food request               |
| `GET`   | `/api/food-posts/` (public)             | ❌          | Browse all available food posts     |

---

### Admin Endpoints

| Method  | Endpoint                               | Auth     | Description              |
| ------- | -------------------------------------- | -------- | ------------------------ |
| `GET`   | `/api/admin/receivers/?status=pending` | ✅ Admin | List receivers by status |
| `PATCH` | `/api/admin/receivers/<id>/approve/`   | ✅ Admin | Approve a receiver       |
| `PATCH` | `/api/admin/receivers/<id>/reject/`    | ✅ Admin | Reject a receiver        |
| `GET`   | `/api/admin/users/`                    | ✅ Admin | List all users           |
| `GET`   | `/api/admin/food-posts/`               | ✅ Admin | List all food posts      |
| `GET`   | `/api/admin/food-requests/`            | ✅ Admin | List all food requests   |

---

## 🔴 Redis Caching — What Is Cached

| Cache Key                | TTL   | Invalidated When                                          |
| ------------------------ | ----- | --------------------------------------------------------- |
| `user_profile:<user_id>` | 5 min | Profile is updated (`PATCH /api/auth/profile/`)           |
| `food_posts:available`   | 1 min | Any food post is created, updated, or deleted             |
| `available_listings`     | 1 min | Any listing is created, accepted, cancelled, or completed |
| `food_requests:open`     | 1 min | Any food request is created, updated, or accepted         |

**Why Redis?** These are the most frequently called endpoints. Caching eliminates repeated MySQL queries for data that doesn't change often, reducing response time from ~50–200ms to <5ms on cache hits.

**Fallback:** If `REDIS_URL` is not set or Redis is unreachable, Django automatically uses `LocMemCache` (in-process memory). No code changes needed.

---

## 🖥 Frontend Pages & Components

### Donor Flow

| Page        | Route                | Description                                         |
| ----------- | -------------------- | --------------------------------------------------- |
| Login       | `/login`             | Role selector + credentials + show/hide password    |
| Register    | `/register`          | Step 1: role, Step 2: form with show/hide passwords |
| Dashboard   | `/donor/dashboard`   | Stats, recent listings, incoming requests           |
| Listings    | `/donor/listings`    | My food listings with status management             |
| Add Listing | `/donor/add-listing` | Create a new food listing                           |
| Requests    | `/donor/requests`    | Open receiver food requests to fulfill              |
| Orders      | `/donor/orders`      | Accepted/completed orders                           |
| Profile     | `/donor/profile`     | Edit profile information                            |

### Recipient Flow

| Page        | Route                    | Description                                 |
| ----------- | ------------------------ | ------------------------------------------- |
| Dashboard   | `/recipient/dashboard`   | Welcome greeting, stats, map, quick actions |
| Browse      | `/recipient/browse`      | Browse available food donations             |
| Claims      | `/recipient/claims`      | My claimed donations                        |
| Listings    | `/recipient/listings`    | My posted food requests                     |
| Add Request | `/recipient/add-request` | Post a new food request                     |
| Impact      | `/recipient/impact`      | View donation impact analytics              |
| Profile     | `/recipient/profile`     | Edit profile                                |

### Key Components

- `StatsCards` — recipient stats overview
- `MapSection` — nearby donations map
- `RoleInfoCard` — dynamic card based on user's receiver role
- `useAuthStore` — Zustand store: login, register, logout, checkAuth
- `lib/api.ts` — Axios client with auto token refresh on 401

---

## 🔒 Security Notes

- Passwords are never returned in API responses (`write_only=True`)
- Rate limiting: 30 req/min anonymous, 200 req/min authenticated, 10 req/min on login
- JWT refresh tokens are blacklisted on logout
- Receiver accounts require admin approval before login allowed
- PAN, pincode, and phone numbers are validated server-side

---

## 📊 Data Flow

```
User logs in → JWT tokens stored in cookies
  ↓
Every API request → Bearer token attached by Axios interceptor
  ↓
401 response → Axios auto-refreshes using refresh token → retries request
  ↓
Logout → Backend blacklists refresh token → cookies cleared → redirect to /login
```

```
Donor creates food post → cache invalidated (food_posts:available)
  ↓
Receiver browses → cache hit (served from Redis, no DB query)
  ↓
Receiver claims → post status updated → cache invalidated again
```

---








Chodu git