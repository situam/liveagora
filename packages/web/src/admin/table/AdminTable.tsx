import { DocumentNames, type AgoraPasswordsRow } from "@liveagora/common";
import AgoraRow from "./AgoraRow";

interface Props {
  data: AgoraPasswordsRow[];
  isLoading: boolean;
  apiError: string | null;
  onCreate: (id: string) => void;
  onUpdate: (row: AgoraPasswordsRow) => void;
  onDelete: (id: string) => void;
}

export default function AdminTable({ data, isLoading, apiError, onCreate, onUpdate, onDelete }: Props) {
  if (isLoading) return <div>Loading…</div>;

  return (
    <div>
      <h2>Live Agora admin</h2>

      <button onClick={() => {
        const name = prompt("Enter a name for the new Live Agora (without spaces or special characters):")
        if (!name) return
        const id = DocumentNames.buildAgoraDoc(name)
        onCreate(id)
      }}>Create new agora</button>

      {apiError && <div style={{ color: "red" }}>{apiError}</div>}

      <table>
        <thead>
          <tr>
            <th>Live Agora</th>
            <th>Read secret</th>
            <th>Backstage secret</th>
            <th>Controls</th>
          </tr>
        </thead>

        <tbody>
          {data.map(row => (
            <AgoraRow
              key={row.id}
              row={row}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
