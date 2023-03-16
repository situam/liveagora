import { useEffect, useState } from "react";
import {
  useHMSActions,
  useHMSNotifications,
} from "@100mslive/react-sdk";


export function LiveAVErrorHandler() {
  const notification = useHMSNotifications();
  const hmsActions = useHMSActions();
  const [showAudioBlockedPopup, setShowAudioBlockedPopup] = useState(false)
  const [showNetworkProblemPopup, setShowNetworkProblemPopup] = useState(false)
  useEffect(() => {
      if (!notification) {
          return;
      }

      if (notification.type == "ERROR")
      {
        console.log("[HmsError] ", notification.data.code)
        if (notification.data.code ==  3008)
        {
          setShowAudioBlockedPopup(true)
        }
      }

      // notification is a reactive object
      // this function will run everytime there is a new notification
      //console.log('notification type', notification.type);

      // The data in notification depends on the notification type
      //console.log('data', notification.data);
  }, [notification]);

  const unblockAudio = async () => {
    await hmsActions.unblockAudio();
    setShowAudioBlockedPopup(false);
  }

  if (showNetworkProblemPopup)
    return (
      <div style={{zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', width: '100vw', height: '100vh'}}>
        <div style={{padding: '1em', background: '#000', color: '#fff', fontSize: '1.5em'}}>
          Error joining the video call!<br/>
          <button onClick={()=>setShowNetworkProblemPopup(false)}>
            ok
          </button>
        </div>
      </div>
    )
  
  return null
}