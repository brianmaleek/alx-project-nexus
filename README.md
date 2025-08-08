# Online Poll System - Setup Instructions

## Project Overview

A comprehensive full-stack polling system with Django REST API backend and React frontend, featuring real-time results, user authentication, and detailed API documentation.

## Backend Setup (Django)

### Requirements

Install the dependencies from the `requirements.txt`:

```txt
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
djangorestframework-simplejwt==5.3.0
drf-yasg==1.21.7
psycopg2-binary==2.9.9
django-filter==23.4
python-decouple==3.8
```

### Installation Steps

1. **Create and activate virtual environment:**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Set up PostgreSQL database:**

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE pollsystem;
CREATE USER polluser WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE pollsystem TO polluser;
\q
```

4. **Create Django project structure:**

```bash
django-admin startproject pollSystem
cd pollSystem
python manage.py startapp pollSystemApi
python manage.py startapp pollSystemAccounts
```

5. **Configure environment variables:**

Create `.env` file in project root:

```env
SECRET_KEY=your-very-secret-key-here
DEBUG=True
DB_NAME=pollsystem
DB_USER=polluser
DB_PASSWORD=password123
DB_HOST=localhost
DB_PORT=5432
```

6. **Run migrations:**

```bash
python manage.py makemigrations pollSystemAccounts
python manage.py makemigrations pollSystemApi
python manage.py migrate
```

7. **Create superuser:**

```bash
python manage.py createsuperuser
```

8. **Run development server:**

```bash
python manage.py runserver
```

### API Endpoints

The backend provides the following REST API endpoints:

#### Authentication

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET/PUT /api/auth/profile/` - User profile management

#### Polls

- `GET /api/polls/` - List all polls (with search and filtering)
- `POST /api/polls/` - Create new poll (authenticated)
- `GET /api/polls/{id}/` - Get specific poll details
- `PUT/PATCH /api/polls/{id}/` - Update poll (owner only)
- `DELETE /api/polls/{id}/` - Delete poll (owner only)
- `POST /api/polls/{id}/vote/` - Vote on poll (authenticated)
- `GET /api/polls/{id}/results/` - Get poll results
- `GET /api/polls/my_polls/` - Get user's created polls
- `GET /api/polls/my_votes/` - Get polls user has voted on

#### Votes

- `GET /api/votes/` - List user's votes (authenticated)

### API Documentation

Access Swagger documentation at:

- **Swagger UI:** `http://localhost:8000/api/docs/`
- **ReDoc:** `http://localhost:8000/api/redoc/`

## Frontend Setup (React)

### Requirements

Create `package.json`:

```json
{
  "name": "poll-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### Installation Steps

1. **Create React app:**

```bash
npx create-react-app poll-frontend
cd poll-frontend
```

2. **Install additional dependencies:**

```bash
npm install lucide-react
```

3. **Install Tailwind CSS:**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

4. **Configure Tailwind CSS:**

Update `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

5. **Add Tailwind directives to CSS:**

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

6. **Replace App.js content** with the provided React component code

7. **Start development server:**

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Features

### Backend Features

- ✅ RESTful API with Django REST Framework
- ✅ JWT-based authentication
- ✅ PostgreSQL database with optimized queries
- ✅ Poll creation with multiple options
- ✅ Voting system with duplicate prevention
- ✅ Real-time result computation
- ✅ Poll expiration handling
- ✅ User profile management
- ✅ Comprehensive API documentation with Swagger
- ✅ CORS configuration for frontend integration
- ✅ Database indexing for performance
- ✅ Admin interface for management

### Frontend Features

- ✅ Responsive React application
- ✅ User authentication (login/register)
- ✅ Poll creation with dynamic options
- ✅ Real-time voting interface
- ✅ Visual result charts with percentages
- ✅ Search and filtering functionality
- ✅ User dashboard with tabs (All Polls, My Polls, My Votes)
- ✅ Profile management
- ✅ Real-time UI updates
- ✅ Mobile-friendly responsive design
- ✅ Loading states and error handling

## Database Schema

### Models

1. **User** (Django's built-in)
2. **UserProfile** - Extended user information
3. **Poll** - Poll information with metadata
4. **Option** - Poll options
5. **Vote** - User votes with constraints

### Key Relationships
- User → UserProfile (One-to-One)
- User → Poll (One-to-Many) - created polls
- Poll → Option (One-to-Many)
- User → Vote (One-to-Many)
- Option → Vote (One-to-Many)

### Database Optimizations

- Indexes on frequently queried fields
- Select_related and prefetch_related for query optimization
- Unique constraints to prevent duplicate votes
- Efficient vote counting with annotations

## Security Features

- JWT authentication with refresh tokens
- CORS configuration
- SQL injection prevention through ORM
- Password validation
- Permission-based access control
- Input validation and sanitization

## API Performance

- Pagination for large datasets
- Database query optimization
- Efficient vote counting
- Caching headers
- Minimal data transfer

## Testing

### Backend Testing

```bash
python manage.py test
```

### Frontend Testing

```bash
npm test
```

## Deployment

### Backend Deployment (Example with Heroku)

1. Install gunicorn: `pip install gunicorn`
2. Create `Procfile`: `web: gunicorn pollsystem.wsgi`
3. Update settings for production
4. Set environment variables
5. Deploy to Heroku

### Frontend Deployment (Example with Netlify)

1. Build the app: `npm run build`
2. Deploy the `build` folder to Netlify
3. Set environment variables for API URL

## Git Workflow

### Recommended Commit Messages

```bash
git commit -m "feat: implement poll creation API"
git commit -m "feat: add user authentication system"
git commit -m "feat: implement voting functionality"
git commit -m "perf: optimize vote counting queries"
git commit -m "docs: add API documentation with Swagger"
git commit -m "style: implement responsive design"
git commit -m "fix: resolve duplicate voting issue"
```

## Environment Variables

### Backend (.env)

```env
SECRET_KEY=your-secret-key
DEBUG=False
DB_NAME=pollsystem
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:8000
```

## Production Considerations

1. **Security:**
   - Use HTTPS in production
   - Set secure JWT settings
   - Configure proper CORS origins
   - Use environment variables for secrets

2. **Performance:**
   - Enable database connection pooling
   - Use Redis for caching
   - Implement rate limiting
   - Optimize database queries

3. **Monitoring:**
   - Set up logging
   - Monitor API performance
   - Track user analytics
   - Set up error reporting

### API Documentation

The system includes comprehensive API documentation using Swagger/OpenAPI specification. All endpoints are documented with:

- Request/response schemas
- Authentication requirements
- Example requests and responses
- Error codes and messages

Access the documentation at `/api/docs/` when the server is running.

## Support

For issues and questions:

1. Check the API documentation
2. Review the console logs
3. Ensure all dependencies are installed
4. Verify database connection
5. Check CORS configuration
