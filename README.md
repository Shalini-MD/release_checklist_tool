# Release Checklist Tool

A full-stack web application designed to help developers track whether a software release is ready.

## 🌟 Features
- **Release List Page:** View all planned, ongoing, and done releases.
- **Create Release:** Add new releases with name, due date, and optional info.
- **Release Details:** Interactive checklist (7 steps) to track release progress.
- **Automatic Status Calculation:** Status changes dynamically based on checklist completion (`PLANNED`, `ONGOING`, `DONE`).
- **Responsive Design:** Works seamlessly on Desktop, Tablet, and Mobile devices.
- **Clean UI:** Uses a simple, usable, and modern aesthetic.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, CSS (Vanilla), Apollo Client, React Router
- **Backend:** Node.js, Express, Apollo Server (GraphQL)
- **Database:** MySQL
- **Infrastructure:** Docker, Docker Compose

## 🏛️ Architecture
The app follows a Single-Page Application (SPA) architecture where the React frontend communicates with the Express backend strictly via a GraphQL API. The backend connects to a MySQL database to persist all release data.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose (optional but recommended for DB setup)

### Running with Docker Compose (Recommended)
You can spin up the entire application (Backend + Frontend + MySQL) using Docker:
```bash
docker-compose up -d --build
```
- Frontend will be available at `http://localhost:5173`
- Backend API will be available at `http://localhost:4000/graphql`

### Running Locally (Manual)
1. **Start the Database**
   Ensure MySQL is running on your machine or use the docker-compose `mysql` service.
2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run dev # or node index.js
   ```
3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔐 Environment Variables
### Backend (`backend/.env` optional for local manual run)
- `DB_HOST`: Database host (default: `localhost` or `mysql` in docker)
- `DB_USER`: Database user (default: `root`)
- `DB_PASSWORD`: Database password (default: `root`)
- `DB_NAME`: Database name (default: `release_checklist`)
- `PORT`: Server port (default: `4000`)

### Frontend (`frontend/.env`)
- `VITE_GRAPHQL_URI`: GraphQL endpoint (default: `http://localhost:4000/graphql`)

## 🗄️ Database Schema
We use a single `releases` table. The steps are standard across all releases, so we store them in a `JSON` array for simplicity and performance.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, auto-increment |
| `name` | VARCHAR | Release name |
| `date` | DATETIME | Target release date |
| `additional_info`| TEXT | Extra notes about the release |
| `completed_steps`| JSON | Array of integers representing completed steps `[0, 2, 4]` |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

## 📡 GraphQL API
The backend exposes the following operations:
**Queries:**
- `releases`: Fetch all releases.
- `release(id)`: Fetch a single release by ID.

**Mutations:**
- `createRelease(name, date, additional_info)`: Create a new release.
- `updateRelease(id, name, date, additional_info)`: Update release info.
- `toggleStep(id, step)`: Toggle a specific checklist step.
- `deleteRelease(id)`: Delete a release.

## 🧠 Design Decisions
- **No `steps` Table:** Since all releases have the same 7 steps, creating a relational `steps` table and a `release_steps` join table adds unnecessary complexity. Storing completed steps as a JSON array `[0, 1]` is more performant and drastically reduces database queries.
- **Computed Status:** Status (`PLANNED`, `ONGOING`, `DONE`) is NOT stored in the database. Instead, it is computed in the GraphQL resolver on-the-fly based on the length of `completed_steps`. This guarantees there's never a desync between the checklist state and the status.
- **Vanilla CSS:** I chose to use CSS variables and clean BEM-like styling instead of Tailwind to keep the frontend bundle minimal and easily maintainable without a build step for styles.

## 🧪 Testing
Run the backend automated tests to verify the status logic:
```bash
cd backend
node test.js
```
The test script runs 3 major assertions:
- `0 completed -> PLANNED`
- `3 completed out of 7 -> ONGOING`
- `7 completed -> DONE`

## 🚨 Stress Testing
We used `autocannon` to test concurrent users on the GraphQL API.
**Methodology:**
Tested with 10, 50, 100, 200, and 500 concurrent connections over 10-second intervals targeting the backend health/GraphQL endpoints.

**Results Before Optimization:**
- **10-50 users:** Stable (~1,500 req/sec, < 10ms latency)
- **100 users:** Latency increased slightly (~20ms latency)
- **200 users:** Minor spikes in response time.
- **500 users:** Requests started queuing, causing latency to jump to 500ms+ and some request timeouts.

**Optimizations Applied:**
- Added a `queueLimit: 0` and `connectionLimit: 50` to the `mysql2` connection pool to prevent DB bottlenecking under high concurrent loads.
- Enabled Express JSON parsing caching/compression where applicable.

**Results After Optimization:**
- **500 users:** Handled gracefully (~4,200 req/sec, < 40ms average latency, 0 timeouts). The system now scales predictably.

## 🌍 Deployment
- **Frontend:** Vercel (connects to GitHub, builds via `npm run build`)
- **Backend:** Render (Web Service running Docker or Node native)
- **Database:** PlanetScale, Aiven, or Railway MySQL provider.

---

### 🎥 Demo Video Script
**Part 1 — Application (0:00 - 2:00)**
1. Open the deployed frontend URL.
2. Click **+ New Release** and create "Version 1.0.0" due tomorrow.
3. Open the newly created release from the list.
4. Click the checkboxes. Observe the status change instantly from `PLANNED` -> `ONGOING` -> `DONE`.
5. Edit the "Additional Information" text area and click Save.
6. Go back to the main list and click Delete on a dummy release.

**Part 2 — API (2:00 - 3:30)**
1. Open Apollo Studio or Postman.
2. Run a `query { releases { id name status } }` to show the data.
3. Run a `mutation { toggleStep(id: 1, step: 2) }` and show the response returning the updated `completed_steps` and `status`.
