## Local development

Install dependencies:

```
nvm use
pnpm install
```

### Backend

#### Setup environment (replace values in .env):
```
cd packages/server
cp .env.example .env
```

#### Setup external services

Currently integrations with the following third party services are needed to enable specific features:

- 100ms: for video-calling
- Bunny Stream: for video file transcoding and delivery
- S3-compatible storage bucket: for image and audio file uploads and delivery (can also be self-hosted, i.e. via Garage or MinIO)

Work is ongoing to migrate to fully open-source/self-hostable alternatives, but this is the working setup for now.

#### Seed database:
```
pnpm run seed
```

#### Run development server:
```
pnpm run dev:server
```

The live agora server should now be running on `http://localhost:3001`

### Frontend

```
pnpm run dev:web
```

You can now access your instance of Live Agora at `http://localhost:5173/agora`
