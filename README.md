# Smart Queue Management System (QR-Based)

A full-stack queue management system that lets users join a queue by scanning a QR code, and lets admins manage and analyze queue activity in real time.

## Features

- 📱 **QR-based queue entry** — users scan a QR code to instantly access the queue-entry form, no app download required
- 🧾 **Simple queue joining** — enter name and phone number to join the queue
- 📊 **Admin Dashboard** — view and manage the live queue
- 📈 **Analytics Dashboard** — visualize historical queue data and trends
- 🌙 **Light/Dark theme toggle**
- 🗄️ **MongoDB-backed** persistent queue storage

## Tech Stack

**Frontend:** React, React Router, Axios, qrcode.react
**Backend:** Node.js, Express
**Database:** MongoDB (via Mongoose)
**Other:** Python (synthetic dataset generation for analytics/demo purposes)

## Project Structure

```
smart-queue/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components (e.g. ThemeToggle)
│   │   ├── context/         # Theme context
│   │   ├── pages/           # App pages (Home, JoinQueue, QueueEntryPage, UserStatus, AdminDashboard, Analytics)
│   │   └── services/        # API service (axios instance)
│   └── .env                 # Frontend environment config (not committed)
│
├── server/                  # Express backend
│   ├── config/               # Database connection
│   ├── controllers/          # Route logic (queue, analytics)
│   ├── models/                # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── utils/                  # CSV import utility
│   ├── server.js
│   └── .env                    # Backend environment config (not committed)
│
├── dataset/                  # Synthetic dataset + generator script for analytics demo
│
└── start-demo.bat            # One-click Windows script to auto-detect IP and launch the app
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally

### 1. Clone the repository
```bash
git clone https://github.com/Sushma-6/Smart--Queue-Management-System.git
cd Smart--Queue-Management-System
```

### 2. Install dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### 3. Configure environment variables

**`server/.env`**
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_queue_system
```

**`client/.env`**
```
HOST=<your-local-ip-address>
REACT_APP_HOST=<your-local-ip-address>
```
> To find your local IP address on Windows, run `ipconfig` and look for the IPv4 Address under your active Wi-Fi/Ethernet adapter. This is required so devices on the same network (e.g. a phone scanning the QR code) can reach your app.

### 4. Start MongoDB
Make sure your local MongoDB service is running:
```bash
net start MongoDB
```

### 5. Run the app

**Option A — Manual (two terminals):**
```bash
# Terminal 1
cd server
node server.js

# Terminal 2
cd client
npm start
```

**Option B — One-click (Windows only):**
Run `start-demo.bat` from the project root (as Administrator). It automatically detects your current IP address, updates `client/.env`, starts MongoDB if needed, and launches both the server and client.
```bash
.\start-demo.bat
```

### 6. Use the app
Open `http://<your-ip>:3000` in a browser — the Home page displays a QR code. Scan it with a phone on the same Wi-Fi network to open the queue-entry form, or navigate directly in a browser.

## Notes

- Since this app relies on your local machine's IP address for other devices (like phones) to connect, the IP must be updated in `client/.env` whenever your network changes. The included `start-demo.bat` script automates this for Windows users.
- `.env` files and `node_modules` are intentionally excluded from this repository — you must create your own `.env` files (see step 3) and run `npm install` after cloning.

## License

This project is for educational/demo purposes.
