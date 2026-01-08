import { generatePassword } from "@liveagora/server/src/lib/generatePassword"
import { useState } from "react"

export enum AccessMode {
  default,
  public,
  custom
}

export function AccessModeEditor({
  modeLabelMap,
  password,
  onUpdate,
  onDelete,
  disabled = false
}: {
  modeLabelMap: Map<AccessMode, String>
  password: string | null | undefined
  onUpdate: (pw: string | null) => void
  onDelete: () => void
  disabled?: boolean
}) {
  const [show, setShow] = useState(false)

  const mode: AccessMode =
    password === undefined
      ? AccessMode.default
      : password === null
        ? AccessMode.public
        : AccessMode.custom

  function onChange(next: AccessMode) {
    switch (next) {
      case AccessMode.default:
        return onDelete()

      case AccessMode.public:
        return onUpdate(null)

      case AccessMode.custom:
        const pw = prompt("Set password:", password ?? generatePassword())
        if (!pw) return
        return onUpdate(pw)
    }
  }

  return (
    <div
      //style={{ display: "flex", flexDirection: "row", width: "100%", alignItems: "space-between" }}
    >
      {
        modeLabelMap.size > 0 &&
        <select disabled={disabled} value={mode} onChange={e => onChange(parseInt(e.target.value))}>
          {
            Array.from(modeLabelMap.entries()).map(([mode, label]) =>
              <option value={mode}>{label}</option>
            )
          }
        </select>
      }


      {mode === AccessMode.custom && password && (
        <>
          <br/>
          <input type={show ? "text" : "password"} value={password} disabled/>
          <button onClick={() => setShow(!show)}>
            {show ? "hide" : "show"}
          </button>
          <button onClick={() => {
            const pw = prompt("Update password:", password)
            if (!pw) return
            onUpdate(pw)
          }}>
            edit
          </button>
        </>
      )}
    </div>
  )
}