import { LiveKitRoom, ParticipantLoop, ParticipantTile, VideoConference, useParticipantContext } from '@livekit/components-react';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';

export const LiveKitRoomProvider = ({children}) => {
  const serverUrl = 'wss://taat.livekit.cloud';
  //const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzcwMDYwMTgsImlzcyI6IkFQSU42bUFqd3hudVFTRyIsIm5iZiI6MTY3NjkxNjAxOCwic3ViIjoibWEiLCJ2aWRlbyI6eyJjYW5QdWJsaXNoIjp0cnVlLCJjYW5QdWJsaXNoRGF0YSI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlLCJyb29tIjoiVGhlIEJhc2VtZW50Iiwicm9vbUpvaW4iOnRydWV9fQ.UFxdb1XoQkiJ6-v4_HY3AW0rY-Sy-4EiuyNzGjMojes';
  let params = new URLSearchParams(document.location.search);
  let token = params.get("token"); 

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      serverUrl={serverUrl}
      token={token}
      connect={true}
    >
      {children}
    </LiveKitRoom>
  );
};

const ParticipantInfo = () => {
  const p = useParticipantContext()

  return (
    <div>
      <pre>{JSON.stringify(p, null, 2)}</pre>
    </div>
  )
}

export const MyFirstLiveKitApp = () => {

  return (
    <LiveKitRoomProvider>
      <ParticipantLoop>
        <ParticipantInfo/>
      </ParticipantLoop>
      {/* <VideoConference /> */}
    </LiveKitRoomProvider>
  )
}