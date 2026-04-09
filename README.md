# Smart Vacation - Travel Deals Platform

A full-stack web application for finding and booking travel deals, built with React (frontend) and Node.js/Express (backend) with MongoDB.

## Project Structure

```
smartVacation/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend (Express + MongoDB)
│   ├── controllers/ # Route handlers
│   ├── models/      # MongoDB schemas
│   ├── services/    # Business logic
│   ├── data/        # Seed data files
│   └── DB/          # Database connection
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for both client and server:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables (see server/.env.example)

4. Seed the database:
```bash
cd server
npm run seed
```

5. Start the development servers:

```bash
# Terminal 1 - Start server
cd server
npm start

# Terminal 2 - Start client
cd client
npm run dev
```

## Available Scripts

### Server
- `npm start` - Start development server with nodemon
- `npm run seed` - Seed database with initial data
- `npm run seed:attractions` - Seed only attractions
- `npm run seed:deals` - Seed only deals
- `npm run seed:destinations` - Seed only destination info

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- Browse travel deals by destination
- View detailed attraction information
- User authentication and profiles
- Shopping cart and checkout
- Responsive design

## API Endpoints

### Attractions
- `GET /api/attractions` - Get all attractions
- `POST /api/attractions/add` - Add new attraction

### Deals
- `GET /api/deals` - Get all deals
- `POST /api/deals/add` - Add new deal

### Users
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user (authenticated)

### Destination Info
- `GET /api/destination-info` - Get destination information

## Technologies Used

- **Frontend**: React, Vite, CSS Modules
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Development**: ESLint, nodemon

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC