import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as API from "../api";
import AdminTable from "./AdminTable";
import { AgoraId, AgoraPasswordsRow } from "@liveagora/common";

interface Props {
  token: string;
}

export default function AdminTableContainer({ token }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["agoras", token],
    queryFn: () => API.getAgoras(token),
    //enabled: false, // disable automatic query on mount (since cached in TokenGate)
    onError: (err: any) => setApiError(String(err)),
  });

  const createMutation = useMutation({
    mutationFn: (id: AgoraId) => API.createAgora(token, id),
    onSuccess: () => queryClient.invalidateQueries(["agoras", token]),
    onError: (err: any) => setApiError(String(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (data: API.UpdateAgoraInput) => API.updateAgora(token, data),
    onSuccess: () => queryClient.invalidateQueries(["agoras", token]),
    onError: (err: any) => setApiError(String(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: AgoraId) => API.deleteAgora(token, id),
    onSuccess: () => queryClient.invalidateQueries(["agoras", token]),
    onError: (err: any) => setApiError(String(err)),
  });

  return (
    <AdminTable
      data={query.data || []}
      isLoading={query.isLoading}
      apiError={apiError}
      onCreate={createMutation.mutate}
      onUpdate={updateMutation.mutate}
      onDelete={deleteMutation.mutate}
    />
  );
}
