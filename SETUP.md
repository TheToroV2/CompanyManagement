# Setup Instructions

## What You Need

- Node.js v18 or higher
- npm v9 or higher

## Installation

Install packages in both directories:

```bash
cd client
npm install

cd ../server
npm install
```

## Running the App

Open two terminal windows.

**Terminal 1 - Start the backend:**

```bash
cd server
npm start
```

It will run on http://localhost:3001

**Terminal 2 - Start the frontend:**

```bash
cd client
npm run dev
```

It will open at http://localhost:5173

## Test Data (Optional)

To populate with test companies before you start:

```bash
cd server
npm run init-file-db
```

This creates three test entries:
- NIT 900674335 (already registered - will be blocked)
- NIT 900674336 (available to register)
- NIT 811033098 (available to register)

The data file lives in `server/data/companies.json` and is created automatically when you register a company.

## How to Use

1. Enter a NIT (company tax ID) to look it up
2. If the company doesn't exist, you'll get the registration form
3. Fill in the details (company name, people, email, phone, address)
4. On success, you'll see the registered company
5. Click to register another one

## Common Issues

**Port in use?** The backend uses port 3001. If it's taken, set a different PORT before running npm start.

**Frontend not connecting?** Make sure the backend is already running on localhost:3001.

**Data file not created?** It auto-creates on first save. Run the init script if you need test data.
