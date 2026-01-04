import { useState } from "react";
import { AgoraId, DocumentNames, type AgoraPasswordsRow } from "@liveagora/common";
import { maskPassword } from "../util";
import { UpdateAgoraInput } from "../api";

export default function AgoraRow({
  row,
  onUpdate,
  onDelete,
}: {
  row: AgoraPasswordsRow;
  onUpdate: (data: UpdateAgoraInput) => void;
  onDelete: (agoraId: AgoraId) => void;
}) {
  const [isEditing, setEditing] = useState(false);
  const [edit, setEdit] = useState({
    read_password: row.read_password,
    edit_password: row.edit_password,
  });

  const readPwDisplay = isEditing ? edit.read_password : maskPassword(row.read_password) ?? ''
  const editPwDisplay = isEditing ? edit.edit_password : maskPassword(row.edit_password) ?? ''

  const agoraId: AgoraId = DocumentNames.parseAgoraIdFromDocName(row.id)

  return (
    <tr>
      <td>
        <a href={`/agora/${agoraId}`} target="_blank" rel="noopener noreferrer">
          {agoraId}
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
                onUpdate({
                  id: agoraId,
                  row: {
                    ...row,
                    ...edit
                  }
                });
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
              const input = prompt(`Are you sure? Type the name "${agoraId}" to confirm permanent deletion:`)
              if(!input) return
              if(input !== agoraId) {
                alert("Agora name did not match. Deletion cancelled.")
                return
              }
              onDelete(agoraId)
            }}>delete</button>
          </>
        )}
      </td>
    </tr>
  );
}
