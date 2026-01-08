import { AgoraId, DocumentNames, type AgoraPasswordsRow } from "@liveagora/common";
import { UpdateAgoraInput } from "../api";
import { AccessMode, AccessModeEditor } from "../../components/Backstage/AccessModeEditor";

export default function AgoraRow({
  row,
  onUpdate,
  onDelete,
}: {
  row: AgoraPasswordsRow;
  onUpdate: (data: UpdateAgoraInput) => void;
  onDelete: (agoraId: AgoraId) => void;
}) {
  const agoraId: AgoraId = DocumentNames.parseAgoraIdFromDocName(row.id)

  return (
    <tr>
      <td>
        <a href={`/agora/${agoraId}`} target="_blank" rel="noopener noreferrer" style={{
          fontWeight: "bold"
        }}>
          {agoraId}
        </a>
      </td>

      <td>
        <AccessModeEditor
          modeLabelMap={new Map([
            [AccessMode.public, "public"],
            [AccessMode.custom, "password"]
          ])}
          password={row.read_password}
          onUpdate={(pw) => onUpdate({
            id: agoraId,
            row: {
              ...row,
              read_password: pw
            }
          })}
          onDelete={() => onUpdate({
            id: agoraId,
            row: {
              ...row,
              read_password: null
            }
          })}
        />
      </td>

      <td>
        <AccessModeEditor
          modeLabelMap={new Map([
            [AccessMode.custom, "password"]
          ])}
          password={row.edit_password}
          onUpdate={(pw) =>
            onUpdate({
              id: agoraId,
              row: {
                ...row,
                edit_password: pw!
              }
            })
          }
          onDelete={() => {}}
          disabled={true}
        />
      </td>

      <td>
        <a href={`/agora/${agoraId}?backstage`} target="_blank" rel="noopener noreferrer">
          backstage
        </a>
        <br/>

        <button onClick={() => {
          const input = prompt(`Are you sure? Type the name "${agoraId}" to confirm permanent deletion:`)
          if(!input) return
          if(input !== agoraId) {
            alert("Agora name did not match. Deletion cancelled.")
            return
          }
          onDelete(agoraId)
        }}>delete</button>
      </td>
    </tr>
  );
}
