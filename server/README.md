# Smart Vacation Server

Node.js/Express backend for the Smart Vacation travel platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`

3. Seed the database:
```bash
npm run seed
```

4. Start the server:
```bash
npm start
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret

## Database Models

- **User**: User accounts with authentication
- **Attraction**: Travel attractions with details
- **Deal**: Travel deals/packages
- **DestinationInfo**: Information about destinations

## API Routes

See main.js for all available routes and controllers for implementation details.