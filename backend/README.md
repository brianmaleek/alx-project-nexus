# Building a Backend for an Online Poll System - ProDev BE

## Online Poll System Backend

### Real-World Application

This project simulates backend development for applications requiring real-time data processing. Developers gain experience with: - Building scalable APIs for real-time voting systems. - Optimizing database schemas for frequent operations. - Documenting and deploying APIs for public access.

### Overview

This case study focuses on creating a backend for an online poll system. The backend provides APIs for poll creation, voting, and real-time result computation. The project emphasizes efficient database design and detailed API documentation.

### Project Goals

The primary objectives of the poll system backend are: - `API Development`: Build APIs for creating polls, voting, and fetching results. - `Database Efficiency`: Design schemas optimized for real-time result computation. - `Documentation`: Provide detailed API documentation using Swagger.

### Technologies Used

- `Django`: High-level Python framework for rapid development.
- `PostgreSQL`: Relational database for poll and vote storage.
- `Swagger`: For API documentation.

### Key Features

#### 1. Poll Management

- APIs to create polls with multiple options.
- Include metadata such as creation date and expiry.

#### 2. Voting System

- APIs for users to cast votes.
- Implement validations to prevent duplicate voting.

#### 3. Result Computation

- Real-time calculation of vote counts for each option.
- Efficient query design for scalability.

#### 4. API Documentation

- Use Swagger to document all endpoints.
- Host documentation at `/api/docs` for easy access.

### Implementation Process

#### Git Commit Workflow

#### Initial Setup:

```bash
feat: set up Flask project with PostgreSQL
```

Feature Development:

```bash
feat: implement poll creation and voting APIs
feat: add results computation API
```

Optimization:

```bash
perf: optimize vote counting queries
```

Documentation:

```bash
feat: integrate Swagger documentation
docs: update README with API usage
```

#### Submission Details

- `Deployment`: Host the API and Swagger documentation.

#### Evaluation Criteria

#### 1. Functionality

- Polls and options are created and stored accurately.
- Voting works without duplication errors.

#### 2. Code Quality

- Code adheres to Django best practices and is modular.
- PostgreSQL models are efficient and normalized.

#### 3. Performance

- Vote counting queries are optimized for scalability.
- Real-time results are computed efficiently.

#### 4. Documentation

- Swagger documentation is detailed and accessible.
- README includes setup instructions and usage examples.
