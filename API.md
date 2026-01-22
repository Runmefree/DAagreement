# API Documentation

Complete API reference for the Auth App backend.

## Base URL

Development: `http://localhost:5000`

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are returned from login/signup endpoints and are valid for 7 days.

---

## Endpoints

### 1. User Registration

**Endpoint:** `POST /auth/signup`

Register a new user account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "MyPassword123",
  "name": "John Doe"
}
```

**Required Fields:**
- `email` (string, unique, valid email format)
- `password` (string, min 6 characters recommended)
- `name` (string, non-empty)

**Success Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Missing required fields | One or more fields are empty |
| 409 | Email already registered | Email exists in database |
| 500 | Internal server error | Server error |

**Example cURL:**
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "MyPassword123",
    "name": "John Doe"
  }'
```

---

### 2. User Login

**Endpoint:** `POST /auth/login`

Login with email and password credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "MyPassword123"
}
```

**Required Fields:**
- `email` (string)
- `password` (string)

**Success Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Missing email or password | One or more fields empty |
| 401 | Invalid credentials | Wrong email or password |
| 500 | Internal server error | Server error |

**Example cURL:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "MyPassword123"
  }'
```

---

### 3. Google OAuth Login

**Endpoint:** `POST /auth/google-login`

Authenticate using Google OAuth token. Creates new account if user doesn't exist.

**Request Body:**
```json
{
  "credential": "google_jwt_token"
}
```

**Required Fields:**
- `credential` (string): Google ID token from `@react-oauth/google`

**Success Response:** `200 OK`
```json
{
  "user": {
    "id": 2,
    "email": "user@gmail.com",
    "name": "Google User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Missing credential | No token provided |
| 400 | Invalid token | Token validation failed |
| 500 | Internal server error | Server error |

**Example cURL:**
```bash
curl -X POST http://localhost:5000/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
  }'
```

---

### 4. Get User Profile

**Endpoint:** `GET /auth/profile`

Retrieve the authenticated user's profile information.

**Required:** Authorization header with valid JWT token

**Success Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 401 | No token provided | Missing Authorization header |
| 401 | Invalid token | Token is invalid or expired |
| 404 | User not found | User was deleted from database |
| 500 | Internal server error | Server error |

**Example cURL:**
```bash
curl -X GET http://localhost:5000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 5. Health Check

**Endpoint:** `GET /health`

Check if the server is running and healthy.

**Success Response:** `200 OK`
```json
{
  "status": "ok"
}
```

**Example cURL:**
```bash
curl http://localhost:5000/health
```

---

## JWT Token Structure

JWT tokens contain the following payload:

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1673450000,
  "exp": 1674055000
}
```

- `id`: User ID from database
- `email`: User email
- `name`: User full name
- `iat`: Issued at (Unix timestamp)
- `exp`: Expiration (7 days from issue)

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:
- 5-10 requests per minute per IP for signup/login
- Exponential backoff after failed attempts
- Account lockout after 10 failed login attempts

---

## CORS

Backend accepts requests from `http://localhost:3000` (frontend).

For production, update `FRONTEND_URL` environment variable.

---

## Testing Endpoints

### Using Postman

1. Create new request
2. Select HTTP method (POST/GET)
3. Enter URL: `http://localhost:5000/auth/...`
4. Add body (for POST): JSON format
5. For protected routes, add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`

### Using cURL

See examples in each endpoint section above.

### Using JavaScript/Frontend

```javascript
// Login
const response = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});
const data = await response.json();
```

---

## Troubleshooting

**"No token provided"**
- Add Authorization header to request
- Token should start with "Bearer "

**"Invalid token"**
- Token might be expired (7-day limit)
- Token might be corrupted
- Try logging in again

**"Email already registered"**
- Email address is taken
- Use different email or login instead

**"Invalid credentials"**
- Wrong email or password
- Check spelling carefully

**CORS errors**
- Make sure backend is running on port 5000
- Check frontend URL in backend .env
- Try requests from same-origin for testing
