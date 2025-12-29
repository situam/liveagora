import type { AgoraPasswordsRow } from "@liveagora/common";
import AgoraRow from "./AgoraRow";

interface Props {
  data: AgoraPasswordsRow[];
  isLoading: boolean;
  apiError: string | null;
  onUpdate: (row: AgoraPasswordsRow) => void;
  onDelete: (id: string) => void;
}

export default function AdminTable({ data, isLoading, apiError, onUpdate, onDelete }: Props) {
  if (isLoading) return <div>Loading…</div>;

  return (
    <div>
      <h2>Live Agora admin</h2>

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
