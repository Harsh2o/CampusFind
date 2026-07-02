# CampusFind - Advanced MERN Stack Application

CampusFind is a centralized, community-driven platform designed to reunite university students with their lost belongings. This application modernizes the traditional "Lost & Found" box with a robust digital solution.

## 🚀 Key Features
- **Real-Time Messaging**: Built with `socket.io`, allowing users to privately message each other to coordinate returning items.
- **Interactive Maps**: Integrated `react-leaflet` allows users to drop a precise pin where an item was lost or found.
- **AI-Powered Smart Matching**: A backend algorithm that scans the database to find potential matches between reported lost and found items.
- **Admin Analytics Dashboard**: A protected admin route featuring data visualization (`Recharts`) to track application usage trends and category breakdowns.
- **Automated Email Alerts**: Configured with `Nodemailer` to send welcome and alert emails.
- **Secure Authentication**: JWT-based authentication with protected API routes.

## 🛠 Technology Stack
- **Frontend**: React.js, Vite, React Router, Recharts, React-Leaflet
- **Backend**: Node.js, Express.js, Socket.io, Nodemailer
- **Database**: MongoDB (Mongoose)

## 📦 Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/CampusFind.git
   cd CampusFind
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/campusfind
   JWT_SECRET=your_super_secret_key
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token

### Items
- `GET /api/items/recent` - Fetch 4 most recent items
- `GET /api/items/lost` - Fetch all lost items (supports search & filter)
- `POST /api/items/lost` - Report a lost item (triggers smart matching)
- `PUT /api/items/:type/:id` - Update status of an item

### Messages (Socket.io)
- `GET /api/messages/:userId` - Get chat history
- `GET /api/messages/contacts/list` - Get active conversations

## 📄 License
This project is licensed under the MIT License.
