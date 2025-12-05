import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TokenGate from "./TokenGate";
import AdminTableContainer from "./table/AdminTableContainer";

const queryClient = new QueryClient();

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      {!token ? (
        <TokenGate onUnlock={setToken} />
      ) : (
        <AdminTableContainer token={token}/>
      )}
    </QueryClientProvider>
  );
}
