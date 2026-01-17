import { AgoraId, AgoraIdSchema, type AgoraPasswordsRow } from "@liveagora/common";
import AgoraRow from "./AgoraRow";
import { UpdateAgoraInput } from "../api";
import { DashboardBox } from "../../components/Backstage/DashboardBox";

interface Props {
  data: AgoraPasswordsRow[];
  isLoading: boolean;
  apiError: string | null;
  onCreate: (id: AgoraId) => void;
  onUpdate: (data: UpdateAgoraInput) => void;
  onDelete: (id: AgoraId) => void;
}

export default function AdminTable({ data, isLoading, apiError, onCreate, onUpdate, onDelete }: Props) {
  if (isLoading) return <div>Loading…</div>;

  return (
    <div style={{margin: '1rem'}}>
      <h2>/admin.html</h2>

      <DashboardBox>
        <button onClick={() => {
          const name = prompt("Enter a name for the new Live Agora (lowercase, without spaces or special characters):")
          if (!name) return
          const agoraId = AgoraIdSchema.safeParse(name)
          if (!agoraId.success) return alert(`Error: invalid name ${agoraId.error}`)
          onCreate(agoraId.data!)
        }}>create agora</button>
      </DashboardBox>

      {apiError && <div style={{ color: "red" }}>{apiError}</div>}

      <DashboardBox>
        <h2>/agoras</h2>
        <table>
          <thead>
            <tr>
              <th>name</th>
              <th>read access</th>
              <th>edit access</th>
              <th>controls</th>
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
      </DashboardBox>
    </div>
  );
}
