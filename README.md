# Company Management System

A web application for validating company identification numbers (NIT) and registering companies through a secure backend service. Built with React 18+, Vite, and Node.js v20+ Express.js.

## What This Does

A full-stack web app for registering companies in Colombia. You enter a company's NIT (tax ID), and if it doesn't exist, you can register the company with details like name, email, phone, and address. Data is stored and persists between sessions.

### Tech Stack

- **Frontend**: React 18+, Vite, CSS3
- **Backend**: Node.js v20+, Express.js, JavaScript (ES6 modules)
- **Communication**: REST API with JSON

##  Project Structure

```
companieManagement/
├── client/                           # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx                  # Main application component
│   │   ├── App.css                  # App styles
│   │   ├── main.jsx                 # React entry point
│   │   ├── index.css                # Global styles
│   │   ├── components/              # Reusable React components
│   │   │   ├── NITValidation.jsx    # NIT validation form
│   │   │   ├── NITValidation.css    # NIT validation styles
│   │   │   ├── CompanyRegistration.jsx  # Company registration form
│   │   │   └── CompanyRegistration.css  # Registration styles
│   │   └── services/                # API communication
│   │       └── api.js               # API client functions
│   ├── index.html                   # HTML entry point
│   ├── vite.config.js               # Vite configuration
│   └── package.json
│
├── server/                           # Express.js backend
│   ├── src/
│   │   ├── index.js                 # Server entry point
│   │   ├── routes/                  # API routes
│   │   │   ├── validation.js        # NIT validation endpoint
│   │   │   └── companies.js         # Company CRUD endpoints
│   │   └── middleware/              # Express middleware
│   └── package.json
│
└── package.json                     # Root package.json for scripts
```

##  Installation & Setup

### Prerequisites

- **Node.js** v20 or higher
- **npm** or yarn

### Install Dependencies

From the project root directory, run:

```bash
npm run install:all
```

This installs dependencies for root, server, and client packages.

### Start Development Servers

**Option 1: Run both servers (Recommended)**

```bash
# Terminal 1 - Backend (Port 3001)
npm run server

# Terminal 2 - Frontend (Port 5173)
npm run client
```

**Option 2: Individual commands**

```bash
# Backend
cd server && npm run dev

# Frontend (in another terminal)
cd client && npm run dev
```

**Access the application:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

##  Registration Flow

### Step 1: NIT Validation
- User enters company NIT (Colombian Tax ID)
- Format: `XXXXXXXXXX-X` (10 digits + check digit)
- Backend validates format and eligibility
- Success → Proceed to registration form
- Failure → Display error message

### Step 2: Company Registration
- User completes form with:
  - NIT (pre-filled)
  - Company Name
  - Email
  - Phone
  - Address
- All fields required
- Backend validates and checks for duplicates
- Company stored in system

### Step 3: Success
- Confirmation screen with company details
- Option to register another company
- Status: "active"

##  API Endpoints

### Validation Service

**Health Check**
```
GET /api/validation/health
```

**Validate NIT**
```
POST /api/validation/nit
Content-Type: application/json

{
  "nit": "123456789-1"
}
```

**Response (Success)**:
```json
{
  "valid": true,
  "message": "NIT format is valid",
  "nit": "123456789-1"
}
```

### Company Service

**Get All Companies**
```
GET /api/companies
```

**Register Company**
```
POST /api/companies
Content-Type: application/json

{
  "nit": "123456789-1",
  "name": "TechCorp Colombia",
  "email": "info@techcorp.com",
  "phone": "+57 (601) 123-4567",
  "address": "Bogotá, Colombia"
}
```

**Get Company by NIT**
```
GET /api/companies/:nit
```

##  Frontend Components

### NITValidation
- **File**: `client/src/components/NITValidation.jsx`
- Validates company NIT
- Real-time input validation
- Error/success alerts

### CompanyRegistration
- **File**: `client/src/components/CompanyRegistration.jsx`
- Captures company details
- Form validation
- Back navigation

### App
- **File**: `client/src/App.jsx`
- Multi-step flow management
- API health status
- Success screen

##  API Client

**File**: `client/src/services/api.js`

```javascript
validateNIT(nit)           // Validate company NIT
registerCompany(data)      // Register new company
getCompanies()             // List all companies
getCompanyByNIT(nit)       // Get specific company
checkHealth()              // Check API health
```

##  Validation Rules

**NIT**
- Format: `XXXXXXXXXX-X` or `XXXXXXXXXX`
- Length: 8-10 digits minimum
- Characters: Numbers, dashes, spaces

**Company Registration**
- NIT: Required, must be unique
- Name: Required, non-empty
- Email: Required, valid format
- Phone: Required, 7+ digits
- Address: Required, non-empty

##  Data Storage

Currently uses **Flat Files**. For production:

- PostgreSQL
- MongoDB
- Firebase
- Supabase

Modify `server/src/routes/` to implement database integration.

##  Building for Production

**Frontend**
```bash
cd client
npm run build
```
Outputs to `client/dist/`

**Backend**
Runs directly with Node.js (no build needed)

**Deployment**
- Frontend: Render
- Backend: Render
- Set `NODE_ENV=production`
- Use environment variables

##  Security Considerations

- CORS enabled  
- Input validation  
- Add authentication (JWT/OAuth)  
- Add rate limiting  
- Use HTTPS in production  
- Replace in-memory storage with database

##  Debugging

### Frontend
- Open DevTools (F12)
- Check Console for errors
- Network tab for API calls
- Verify backend running at `http://localhost:3001`

### Backend
- Check terminal logs
- Verify syntax in route files
- Check ES6 module imports

### Common Issues

**Backend won't start**
- Run `npm install` in server folder
- Check port 3001 is not in use

**Frontend won't load**
- Ensure Vite running: `npm run dev`
- Clear browser cache
- Check console for import errors

**API calls failing**
- Verify both servers running
- Check network connectivity
- Inspect Network tab responses


## Support

1. Check console error messages
2. Review API response codes
3. Verify dependencies installed
4. Confirm both servers running


##  Resources

- [Express.js Docs](https://expressjs.com)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [REST API Best Practices](https://restfulapi.net)

## Deploying to Render

This repository is prepared to run as a single Node web service on Render: the Express backend will serve API routes and the built frontend from `client/dist`.

Quick steps (Render will run these commands):

1. Build the client and start the server locally (verify):

```bash
npm run build        # builds client into client/dist
npm run start        # starts the Express server which serves client/dist and API
```

2. In the Render dashboard, create a new **Web Service** and connect your repo. Use these settings:

- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Environment**: `Node`
- **Branch**: your default branch (e.g., `main`)

Alternatively, a `render.yaml` is included for infra-as-code configuration. It defines a single `web` service that runs the build and start steps. Commit and push this file and Render can pick it up automatically on deploy.

Notes:
- Ensure any environment variables you need are set in the Render service settings.
- The server listens on `process.env.PORT` as required by Render.
- If you prefer splitting frontend and backend into two Render services, deploy the `client/dist` as a Static Site and the `server` as a Web Service instead.

