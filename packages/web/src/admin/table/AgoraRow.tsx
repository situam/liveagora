import { useState } from "react";
import { DocumentNames, type AgoraPasswordsRow } from "@liveagora/common";
import { maskPassword } from "../util";

export default function AgoraRow({
  row,
  onUpdate,
  onDelete,
}: {
  row: AgoraPasswordsRow;
  onUpdate: (r: AgoraPasswordsRow) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setEditing] = useState(false);
  const [edit, setEdit] = useState({
    read_password: row.read_password,
    edit_password: row.edit_password,
  });

  const readPwDisplay = isEditing ? edit.read_password : maskPassword(row.read_password) ?? ''
  const editPwDisplay = isEditing ? edit.edit_password : maskPassword(row.edit_password) ?? ''

  const agoraName = DocumentNames.getAgoraNameFromDocName(row.id)

  return (
    <tr>
      <td>
        <a href={`/agora/${agoraName}`} target="_blank" rel="noopener noreferrer">
          {agoraName}
        </a>
      </td>

      <td>
        <input
          value={readPwDisplay}
          //placeholder={edit.read_password === null ? "Public" : ""}
          disabled={!isEditing}
          onChange={e => setEdit(v => ({ ...v, read_password: e.target.value || null }))}
        />
      </td>

      <td>
        <input
          value={editPwDisplay}
          //placeholder={edit.read_password === null ? "Public" : ""}
          disabled={!isEditing}
          onChange={e => setEdit(v => ({ ...v, edit_password: e.target.value }))}
        />
      </td>

      <td>
        {isEditing ? (
          <>
            <button
              onClick={() => {
                onUpdate({ ...row, ...edit });
                setEditing(false);
              }}
            >
              Save
            </button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)}>edit</button>
            <button onClick={() => {
              const input = prompt(`Are you sure? Type the name "${agoraName}" to confirm permanent deletion:`)
              if(!input) return
              if(input !== agoraName) {
                alert("Agora name did not match. Deletion cancelled.")
                return
              }
              onDelete(row.id)
            }}>delete</button>
          </>
        )}
      </td>
    </tr>
  );
}
