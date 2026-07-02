<div align="center">
  
  # 🎯 CampusFind
  
  **The ultimate digital Lost & Found solution for university campuses.**
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)
  
  <p align="center">
    An advanced full-stack MERN web application engineered to reunite students with their lost belongings through AI-powered smart matching, real-time messaging, and interactive geolocation.
  </p>
</div>

<hr />

## 📖 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [📂 Project Structure](#-project-structure)
- [🚀 Quick Start / Local Setup](#-quick-start--local-setup)
- [📡 API Documentation](#-api-documentation)
- [📊 CI/CD Workflow](#-cicd-workflow)
- [📝 License](#-license)

---

## ✨ Key Features

- 🧠 **AI-Powered Smart Matching**: A backend algorithm parses newly reported lost items against the database of found items using Regex keyword analysis and category matching, instantly alerting users of potential matches.
- 💬 **Real-Time WebSocket Chat**: Secure, private, real-time messaging powered by `Socket.io`, allowing users to coordinate item returns without exposing personal phone numbers or emails.
- 🗺️ **Interactive Geolocation Maps**: Integrated `react-leaflet` allows users to drop a precise GPS pin when reporting an item, rendering an interactive "Map View" on the central browsing dashboard.
- 📈 **Admin Analytics Dashboard**: A protected admin route featuring complex data visualization (built with `Recharts`) to track application usage trends, category breakdowns, and user activity over time.
- 📧 **Automated Email Service**: Configured with `Nodemailer` to handle background job processing for sending welcome and alert emails dynamically.
- 🔒 **Robust Security & Auth**: JWT-based stateless authentication, bcrypt password hashing, protected API middleware, and secure state management.

---

## 🛠️ Tech Stack & Architecture

### **Client (Frontend)**
- **Framework**: React.js (Vite)
- **Routing**: React Router DOM v6
- **State Management**: React Context API & Hooks
- **Styling**: Pure CSS / Glassmorphism UI
- **Data Visualization & Mapping**: Recharts, React-Leaflet
- **HTTP Client**: Axios

### **Server (Backend)**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM
- **WebSockets**: Socket.io
- **File Uploads**: Multer
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.js
- **Mail Service**: Nodemailer

---

## 🚀 Quick Start / Local Setup

Follow these instructions to run the project locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/Harsh2o/CampusFind.git
cd CampusFind
```

### 2. Setup the Backend
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campusfind
JWT_SECRET=generate_your_own_secret_key
```

Start the backend development server:
```bash
npm run dev
```
*(The server will run on `http://localhost:5000`)*

### 3. Setup the Frontend
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend Vite server:
```bash
npm run dev
```
*(The application will run on `http://localhost:5173`)*

---

## 📡 API Documentation

The backend exposes a RESTful API. Below are some of the primary endpoints:

| Route | Method | Description | Access |
|---|---|---|---|
| `/api/auth/register` | `POST` | Register a new user | Public |
| `/api/auth/login` | `POST` | Authenticate user & get token | Public |
| `/api/items/recent` | `GET` | Fetch 4 most recent items | Public |
| `/api/items/lost` | `GET` | Fetch lost items (with query filters) | Public |
| `/api/items/lost` | `POST` | Report a lost item & trigger match algo | Private |
| `/api/items/:type/:id`| `PUT` | Update the status of an item | Private |
| `/api/admin/stats` | `GET` | Aggregation pipeline for Recharts | Admin |
| `/api/messages/:id` | `GET` | Fetch chat history with a user | Private |

---

## 📊 CI/CD Workflow
This repository is configured with a **GitHub Actions** CI/CD pipeline (`.github/workflows/main.yml`). 
On every `push` or `pull request` to the `main` branch, the workflow automatically provisions an Ubuntu runner, installs both frontend and backend dependencies, and validates the production build using Node.js matrix testing (v18 & v20).

---

## 📝 License
This project is open source and available under the [MIT License](LICENSE).

<div align="center">
  <br>
  <i>Built with ❤️ for University Communities</i>
</div>
