export function maskPassword(pw: string | null) {
  if (!pw) return "";
  return "•".repeat(pw.length)
}