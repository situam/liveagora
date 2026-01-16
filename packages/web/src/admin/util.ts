export function maskPassword(pw: string | null) {
  if (!pw) return "";
  return "•".repeat(pw.length)
}

export function basicAuthHeader(user: string, pass: string) {
  return `Basic ${btoa(`${user}:${pass}`)}`
}