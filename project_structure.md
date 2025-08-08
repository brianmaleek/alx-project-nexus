# Complete Project Structure

## 📁 Root Project Directory Structure

```
poll-system/
├── backend/                          # Django Backend
│   ├── pollsystem/                   # Main Django Project
│   │   ├── __init__.py
│   │   ├── settings.py               # Django settings configuration
│   │   ├── urls.py                   # Main URL configuration
│   │   ├── wsgi.py                   # WSGI configuration
│   │   └── asgi.py                   # ASGI configuration
│   │
│   ├── pollSystemApi/                # Polls API Django App
│   │   ├── __init__.py
│   │   ├── admin.py                  # Admin interface configuration
│   │   ├── apps.py                   # App configuration
│   │   ├── models.py                 # Poll, Option, Vote models
│   │   ├── serializers.py            # DRF serializers
│   │   ├── views.py                  # API views and viewsets
│   │   ├── urls.py                   # Poll app URL patterns
│   │   ├── tests.py                  # Unit tests
│   │   └── migrations/               # Database migrations
│   │       ├── __init__.py
│   │       ├── 0001_initial.py
│   │       └── ...
│   │
│   ├── PollSystemAccounts/           # User Management Django App
│   │   ├── __init__.py
│   │   ├── admin.py                  # User profile admin
│   │   ├── apps.py                   # App configuration
│   │   ├── models.py                 # UserProfile model
│   │   ├── serializers.py            # User serializers
│   │   ├── views.py                  # Authentication views
│   │   ├── urls.py                   # Auth URL patterns
│   │   ├── tests.py                  # Unit tests
│   │   └── migrations/               # Database migrations
│   │       ├── __init__.py
│   │       ├── 0001_initial.py
│   │       └── ...
│   │
│   ├── static/                       # Static files (CSS, JS, Images)
│   ├── staticfiles/                  # Collected static files (production)
│   ├── media/                        # User uploaded files
│   ├── templates/                    # Django templates (if any)
│   ├── requirements.txt              # Python dependencies
│   ├── manage.py                     # Django management script
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Example environment file
│   └── db.sqlite3                    # SQLite database (development)
│
├── frontend/                         # React Frontend
│   ├── public/                       # Public static files
│   │   ├── index.html                # Main HTML template
│   │   ├── manifest.json             # PWA manifest
│   │   ├── favicon.ico               # Site icon
│   │   └── robots.txt                # SEO robots file
│   │
│   ├── src/                          # React source code
│   │   ├── components/               # Reusable React components
│   │   │   ├── auth/                 # Authentication components
│   │   │   │   ├── LoginForm.js
│   │   │   │   ├── RegisterForm.js
│   │   │   │   └── AuthPage.js
│   │   │   │
│   │   │   ├── poll/                 # Poll-related components
│   │   │   │   ├── PollCard.js
│   │   │   │   ├── PollList.js
│   │   │   │   ├── CreatePollModal.js
│   │   │   │   └── PollResults.js
│   │   │   │
│   │   │   ├── layout/               # Layout components
│   │   │   │   ├── Header.js
│   │   │   │   ├── Navigation.js
│   │   │   │   └── Footer.js
│   │   │   │
│   │   │   └── ui/                   # UI components
│   │   │       ├── SearchAndFilter.js
│   │   │       ├── LoadingSpinner.js
│   │   │       └── ErrorMessage.js
│   │   │
│   │   ├── context/                  # React Context providers
│   │   │   ├── AuthContext.js        # Authentication context
│   │   │   └── PollContext.js        # Poll data context
│   │   │
│   │   ├── services/                 # API and utility services
│   │   │   ├── api.js                # API service class
│   │   │   ├── auth.js               # Authentication utilities
│   │   │   └── utils.js              # Helper utilities
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js            # Authentication hook
│   │   │   ├── usePolls.js           # Polls data hook
│   │   │   └── useLocalStorage.js    # Local storage hook
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Dashboard.js          # Main dashboard
│   │   │   ├── PollDetails.js        # Individual poll page
│   │   │   ├── Profile.js            # User profile page
│   │   │   └── NotFound.js           # 404 page
│   │   │
│   │   ├── styles/                   # CSS and styling
│   │   │   ├── globals.css           # Global styles
│   │   │   ├── components.css        # Component styles
│   │   │   └── tailwind.css          # Tailwind imports
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── constants.js          # App constants
│   │   │   ├── helpers.js            # Helper functions
│   │   │   └── validators.js         # Form validators
│   │   │
│   │   ├── App.js                    # Main App component
│   │   ├── index.js                  # React entry point
│   │   ├── App.css                   # App styles
│   │   └── index.css                 # Global styles
│   │
│   ├── package.json                  # Node.js dependencies
│   ├── package-lock.json             # Locked dependency versions
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Example environment file
│   ├── .gitignore                    # Git ignore rules
│   └── README.md                     # Frontend documentation
│
├── docs/                             # Project documentation
│   ├── API.md                        # API documentation
│   ├── SETUP.md                      # Setup instructions
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── ARCHITECTURE.md               # System architecture
│
├── scripts/                          # Utility scripts
│   ├── setup.sh                      # Setup script
│   ├── deploy.sh                     # Deployment script
│   └── backup.sh                     # Database backup script
│
├── .gitignore                        # Git ignore rules
├── README.md                         # Main project documentation
├── docker-compose.yml                # Docker configuration
├── Dockerfile.backend                # Backend Docker file
├── Dockerfile.frontend               # Frontend Docker file
└── LICENSE                           # Project license
```

## 📋 **Detailed File Descriptions**

### **Backend Files**

#### **Main Project (pollsystem/)**

- `settings.py` - Django configuration including database, middleware, installed apps
- `urls.py` - Main URL routing configuration with API documentation
- `wsgi.py` - WSGI application for deployment

#### **Polls App (polls/)**

- `models.py` - Poll, Option, Vote models with relationships
- `serializers.py` - DRF serializers for API data validation
- `views.py` - ViewSets for CRUD operations and custom actions
- `urls.py` - URL patterns for poll-related endpoints
- `admin.py` - Django admin interface configuration

#### **Accounts App (accounts/)**

- `models.py` - UserProfile model extending Django User
- `serializers.py` - User registration and profile serializers
- `views.py` - Authentication views (login, register, profile)
- `urls.py` - Authentication URL patterns

### **Frontend Files**

#### **Components Structure**

- `auth/` - Login, registration, and authentication components
- `poll/` - Poll creation, display, and voting components
- `layout/` - Header, navigation, and layout components
- `ui/` - Reusable UI components (search, filters, etc.)

#### **Services and Utilities**

- `services/api.js` - Centralized API communication
- `context/` - React Context for state management
- `hooks/` - Custom React hooks for reusable logic
- `utils/` - Helper functions and constants

## 🗂️ **Key Configuration Files**

### **Backend Configuration**

```python
# settings.py - Key sections
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_yasg',
    'polls',
    'accounts',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### **Frontend Configuration**

```json
// package.json - Key dependencies
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}
```

## 🔄 **Data Flow Architecture**

```
Frontend (React) 
    ↕ HTTP Requests (JWT Auth)
Backend API (Django REST)
    ↕ ORM Queries
Database (PostgreSQL)
```

## 📱 **Component Hierarchy**

```
App
├── AuthProvider (Context)
├── AuthPage
│   ├── LoginForm
│   └── RegisterForm
└── Dashboard
    ├── Header
    ├── SearchAndFilter
    ├── PollList
    │   └── PollCard
    └── CreatePollModal
```

## 🗄️ **Database Structure**

```
Users (Django Auth)
    ↓ One-to-One
UserProfile
    ↓ One-to-Many
Polls
    ↓ One-to-Many
Options
    ↓ One-to-Many
Votes (Many-to-One to Users)
```

## 🚀 **Development Workflow**

1. **Backend Development:**

   ```bash
   cd backend/
   python manage.py runserver
   # API available at http://localhost:8000
   ```

2. **Frontend Development:**

   ```bash
   cd frontend/
   npm start
   # App available at http://localhost:3000
   ```

3. **Database Operations:**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

This structure provides clear separation of concerns, scalability, and maintainability for both development and production environments.
