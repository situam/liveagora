import { useState } from "react";
import * as API from "./api";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  onUnlock: (token: string) => void;
}

export default function TokenGate({ onUnlock }: Props) {
  const queryClient = useQueryClient();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await API.getAgoras(input);
      
      // write the result into the query cache
      queryClient.setQueryData(["agoras", input], data);

      onUnlock(input);
    } catch (err) {
      console.error("[TokenGate.handleUnlock]", err);
      setError("wrong password or server error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault()
    handleUnlock()
  }

  return (
    <dialog popover="auto" open>
      <form onSubmit={onSubmit}>
        <label htmlFor="password">enter password for admin workspace</label>
        <input
          id="password"
          type="password"
          placeholder="admin password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
          autoFocus 
        />
        <button
          disabled={!input || loading}
        >
          {loading ? "unlocking…" : "unlock"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </dialog>
  );
}
