# Bunny Stream integration

Live Agora uses [Bunny Stream](https://bunny.net/stream/) for video transcoding and delivery. For instance administrators, the following one-time setup is required.

## 1. Create video library

Stream settings:

- Allow direct file access
- Set CORS origins

## 2. Add values to `packages/server/.env` file:

```
BUNNY_VIDEO_LIBRARY_ID=your_bunny_video_library_id_here
BUNNY_VIDEO_LIBRARY_ACCESS_KEY=your_bunny_video_library_access_key_here
BUNNY_VIDEO_LIBRARY_PULL_ZONE=your_bunny_video_libarary_pull_zone_here
```