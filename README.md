# WorkoutQuest API

A MongoDB-backed workout tracker with GitHub OAuth, player progression, and interactive OpenAPI documentation.

## Setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env` and fill in the MongoDB connection string and a long random `SESSION_SECRET`.
3. Install dependencies with `npm install`.
4. Generate the API spec with `npm run build` (or `npm run swagger`).
5. Start the API with `npm run dev`.

The API listens on `http://localhost:3000`; Swagger UI is at `/api-docs`. MongoDB collections and unique indexes are initialized when the server connects.

## GitHub OAuth

Create a GitHub OAuth App with the callback URL `http://localhost:3000/auth/github/callback`. Add its client ID and secret to `.env`. For Render, configure a separate callback URL using your deployed service's HTTPS address and set `GITHUB_CALLBACK_URL` to it. The OAuth client ID and secret, `SESSION_SECRET`, `MONGODB_URI`, and `DB_NAME` must also be configured in Render.

Open `/auth/github` in a browser and authorize the app. The callback creates or finds the player profile and starts a MongoDB-backed session. GET endpoints are public; POST, PUT, and DELETE require this session. Workout updates and deletes are limited to the signed-in player's workouts. Player updates and deletes are limited to the signed-in player's profile or profiles they created.

## Endpoints

| Resource | Operations |
| --- | --- |
| `/workouts` | GET all, GET by id, POST, PUT by id, DELETE by id |
| `/players` | GET all, GET by id, POST, PUT by id, DELETE by id |
| `/auth` | GitHub sign-in, callback, current player, sign-out |

Workout documents contain name, type, difficulty, duration, XP reward, exercises, completion state, completion timestamp, and player ID. Player documents contain username, display name, email, GitHub ID, avatar, XP, level, creation timestamp, and creator ID.

Payload validation returns HTTP 400 with field errors. Missing resources return 404, duplicate player names/emails return 409, and unauthenticated writes return 401. Public player reads omit email addresses and GitHub provider IDs. Swagger UI documents the request schemas and session requirement. `routes.rest` includes example calls.

## Deploy to Render

Create a Render Web Service connected to the GitHub repository. Use `npm install` as the build command and `npm start` as the start command. Set `MONGODB_URI`, `DB_NAME`, `SESSION_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, and `NODE_ENV=production`. Do not set `PORT`; Render supplies it. Add the deployed callback URL to the GitHub OAuth App. In PowerShell, set `$env:API_BASE_URL='https://your-service.onrender.com'` and run `npm run swagger` before committing the deployment spec.

The API is externally reachable once deployed. GET routes are public; write requests need an authenticated session cookie. Never commit `.env` or expose OAuth secrets in a video.