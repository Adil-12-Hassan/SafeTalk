# SafeTalk

SafeTalk is a real-time messaging app with private one-to-one and group conversations. The project contains a React/Vite client and an Express API backed by MongoDB, Redis, Socket.IO, and Cloudinary.

## Features

- Email one-time-password (OTP) sign-in
- Account signup
- Direct and group conversations
- Real-time messaging, typing indicators, and presence
- Image and file uploads
- Admin user management

## Requirements

- Node.js and npm
- A MongoDB connection string
- A Redis connection URL
- SMTP credentials for sending OTP emails
- Cloudinary credentials for file uploads

## Configuration

Create `server/.env` with the following variables. Keep real credentials private and do not commit this file.

```dotenv
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=
REDIS_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create `client/.env` and set the API URL:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Run locally

In one terminal, install server dependencies and start the API:

```bash
cd server
npm install
npm run dev
```

In another terminal, install client dependencies and start Vite:

```bash
cd client
npm install
npm run dev
```

Open the client URL printed by Vite (by default, `http://localhost:5173`).

## Seed test accounts

After configuring `server/.env`, run:

```bash
cd server
npm run seed
```

The seed script upserts the test admin and regular test user. Both sign in using the email OTP flow, so the configured email service and inbox access are needed. The script does not delete database records.

## Checks

```bash
cd client
npm run lint
npm run build
```

## License

All rights reserved. See [LICENSE](./LICENSE).
