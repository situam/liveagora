import type { ErrorHandler } from "hono"

export const onError: ErrorHandler = (err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      message: "Internal Server Error",
    },
    500
  );
}