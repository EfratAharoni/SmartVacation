# Smart Vacation - Travel Deals Platform

A full-stack web application for finding and booking travel deals, built for Israeli travelers. The app offers smart Hebrew-language search (both AI-powered and rule-based), vibe-based filtering, full user authentication, a shopping cart, and order management.

**Live Demo:** [https://smartvacation.onrender.com](https://smartvacation.onrender.com)

**Project Demo Video:** [Watch here](https://drive.google.com/file/d/1vuJgELxCJhhb_DPZAa5UZQX7zZRsVziB/view?usp=sharing)

---

## Project Structure

```
smartVacation/
├── client/                    # React frontend (Vite)
│   └── src/
│       └── Pages/
│           ├── HomePage.jsx   # Landing page with smart search
│           ├── Deals.jsx      # Deal listing with filters
│           ├── DealDetails.jsx# Full deal info page
│           ├── Attractions.jsx# Attractions listing
│           ├── Cart.jsx       # Shopping cart
│           ├── Checkout.jsx   # Checkout & order form
│           ├── Confirmation.jsx # Order confirmation
│           ├── Favorites.jsx  # Saved favorites
│           ├── Profile.jsx    # User profile & order history
│           ├── About.jsx      # About page
│           ├── Contact.jsx    # Contact page
│           ├── fuzzySearch.js # Hebrew fuzzy search + NLP parser
│           └── useDestinationInfo.js # Custom hook for destination data
├── server/                    # Node.js backend (Express + MongoDB)
│   ├── controllers/           # Route handlers (User, Deal, Attraction, Order, AI)
│   ├── models/                # Mongoose schemas
│   ├── services/              # Business logic (AI.js)
│   ├── middleware/            # JWT auth middleware
│   ├── data/                  # Seed data files
│   ├── DB/                    # Database connection
│   ├── tests/                 # Mocha/Chai/Supertest tests
│   └── main.js                # Express app entry point
├── docker-compose.yml
└── README.md
```

---

## Technologies Used

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 7** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP requests to backend |
| **react-date-range** | Date range picker for search filters |
| **react-i18next / i18next** | Internationalization support |
| **lucide-react / react-icons** | Icon libraries |
| **ESLint + Prettier** | Code quality & formatting |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT (jsonwebtoken)** | User authentication tokens |
| **bcryptjs** | Password hashing |
| **CORS** | Cross-origin request handling |
| **dotenv** | Environment variable management |
| **nodemon** | Dev server auto-restart |

### AI & Smart Search
| Technology | Purpose |
|---|---|
| **Groq API + LLaMA 3.1 8B** (`groq-sdk`) | Primary AI engine — parses free-text Hebrew vacation queries into structured filters, queries MongoDB for matching deals, then ranks and explains results in Hebrew |
| **fuzzySearch.js** (client-side) | Zero-dependency rule-based Hebrew NLP parser — handles typos, Latin transliterations, country→city mapping, vibe detection, and duration parsing. Also serves as server-side fallback when Groq is unavailable |

### DevOps & Deployment
| Technology | Purpose |
|---|---|
| **Docker + Docker Compose** | Containerized local development (MongoDB + server + client) |
| **Render.com** | Cloud deployment (frontend: `smartvacation.onrender.com`, backend as a separate service) |
| **Mocha + Chai + Supertest** | Backend integration tests |

---

## Features

### Smart Search (Three-Step AI Flow)
- **Client-side fuzzy search** (`fuzzySearch.js`): instantly matches Hebrew free-text against 18 destinations using aliases, typo tolerance, and Latin transliterations.
- **AI-powered search** (server `POST /api/ai/search`): three-step pipeline using Groq (LLaMA 3.1 8B):
  1. **Parse** — extracts destination, dates, budget, guests, kosher, and vibe from free Hebrew text
  2. **Query** — fetches matching deals from MongoDB based on the parsed filters
  3. **Rank & Explain** — ranks results by relevance and adds a short Hebrew explanation per deal
- **Local fallback parser**: if Groq is unavailable, the server falls back to a rule-based regex parser (same logic as `fuzzySearch.js`) so search always works.
- Results are displayed in a dedicated **"המלצות סוכן AI"** section with a match score badge (x/10) and explanation per deal.

### Vibe-Based Filtering
Deals can be filtered by "vibe" categories:
- Beach (חוף ובטן-גב)
- Adventure (אקסטרים והרפתקאות)
- Romantic (רומנטי)
- City Trip (סיטי-טריפ)
- Kosher-friendly (כשר בלבד)
- Cheapest deals

### Travel Deals
- Browse deals across 18 international destinations
- Each deal includes: price & discount, hotel name, airline, flight duration, included services, travel tips, visa info, weather, electricity info, and emergency contacts (police, ambulance, Israeli embassy)
- Date range filtering with a Hebrew calendar picker
- Guest count and budget filtering with a dual range slider (0–15,000 ₪)

### User Authentication
- Register and login with email/password
- Passwords hashed with bcryptjs
- JWT tokens for protected routes
- Change password from profile page

### Cart, Checkout & Orders
- Add deals and attractions to a shopping cart (persisted per user in `localStorage`)
- Full checkout flow: customer info, passenger details, payment method
- Orders saved to MongoDB and viewable in the user's profile

### Favorites
- Save and manage favorite deals per user (persisted in `localStorage`)

### Destination Info
- Custom React hook (`useDestinationInfo`) fetches enriched destination data (tips, local info) from the backend to display alongside deal details

---

## API Endpoints

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users/add` | — | Register new user |
| POST | `/api/users/login` | — | Login, returns JWT |
| GET | `/api/users/me` | JWT | Get current user |
| PUT | `/api/users/update/:id` | — | Update user |
| PUT | `/api/users/change-password` | — | Change password |
| DELETE | `/api/users/remove/:id` | — | Delete user |

### Deals
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/deals` | Get all deals |
| GET | `/api/deals/:id` | Get single deal |
| POST | `/api/deals/add` | Add deal |
| PUT | `/api/deals/:id` | Update deal |
| DELETE | `/api/deals/:id` | Delete deal |

### Attractions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/attractions` | Get all attractions |
| GET | `/api/attractions/:id` | Get single attraction |
| POST | `/api/attractions/add` | Add attraction |
| PUT | `/api/attractions/:id` | Update attraction |
| DELETE | `/api/attractions/:id` | Delete attraction |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | JWT | Create order |
| GET | `/api/orders/my` | JWT | Get user's orders |

### Destination Info
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/destination-info` | Get destination info (supports `?destination=` query) |
| POST | `/api/destination-info/add` | Add destination info |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/search` | Parse Hebrew query, fetch & rank matching deals with Groq (LLaMA 3.1 8B) |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check (used to keep Render service alive) |

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm
- A [Groq API key](https://console.groq.com/) (free) — for AI-powered search

### Installation

1. Clone the repository

2. Install dependencies:
```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

3. Configure environment variables for the server (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`) and client (`VITE_API_URL`).

4. Seed the database:
```bash
cd server
npm run seed
```

6. Start development servers:
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

### Docker (Alternative)
```bash
docker-compose up --build
```

---

## Available Scripts

### Server
- `npm start` - Start production server
- `npm run dev` - Start with nodemon (auto-restart)
- `npm run seed` - Seed all data (attractions, deals, destinations)
- `npm run seed:attractions` - Seed only attractions
- `npm run seed:deals` - Seed only deals
- `npm run seed:destinations` - Seed only destination info
- `npm test` - Run Mocha/Chai test suite

### Client
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## Data Models

### Deal
Includes destination, price, originalPrice, discount, dates, rating, airline, flightTime, category, hotel, included services, flightDetails (departure/arrival/class), attractions, isKosherFriendly, currency, visaInfo, weather, electricityInfo, travelTips, and emergencyContacts.

### User
Stores fullName, email (unique), phone, and hashed password.

### Order
Links to a user, contains items (deals/attractions with quantities and prices), customerInfo, passengers list, paymentMethod, totalAmount, and status.

### Attraction
Tourist attraction entries associated with destinations.

### DestinationInfo
Enriched destination data (tips, local information) fetched dynamically on deal detail pages.

---

## License

ISC
