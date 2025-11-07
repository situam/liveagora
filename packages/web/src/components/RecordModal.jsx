import { useAgora } from "../context/AgoraContext"


export function useRecorder() {
    const agora = useAgora()

    const startRecording = async () => {
        const w = window.innerWidth
        const h = window.innerHeight

        const ok = window.confirm(`The recording bot will match your window size (${w}x${h}px) and follow your viewpoint as you pan/zoom. Currently it will only enter the first space if publicly accessible. Request recording?`)
        if (!ok) return

        window.agoraBroadcastViewport = true

        const res = await fetch(`https://hocuspocus.taat.live/rec/start?agora=${agora.name}&width=${w}&height=${h}&followId=${agora.clientID}`)
        alert(await res.text())
    }

    const stopRecording = async () => {
        window.agoraBroadcastViewport = false

        const fileUrl = 'https://hocuspocus.taat.live/rec/stop';
        window.open(fileUrl, '_blank');
    }

    return { startRecording, stopRecording }
}

