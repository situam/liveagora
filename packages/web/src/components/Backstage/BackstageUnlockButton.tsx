import { useAgora } from "../../context/AgoraContext"

export function BackstageUnlockButton() {
  const agora = useAgora()

  const requestEditAccess = async () => {
    let password = prompt("Enter password to unlock backstage:")
    if (!password)
      return

    let success = await agora.syncProvider.requestEditAccess(password)
    if (!success)
      alert("wrong password")
  }

  return (
    <button
      onClick={requestEditAccess}
      title={"unlock backstage"}
      aria-label={"unlock backstage"}
    >
      unlock
    </button>
  )
}