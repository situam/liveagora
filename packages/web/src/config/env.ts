// TODO: better env schema

export const Env = {
  baseUrl: import.meta.env.VITE_BASE,
  isCommunityVersion: import.meta.env.VITE_IS_COMMUNITY_VERSION === 'true',
  docNamespace: import.meta.env.VITE_DOC_NAMESPACE ?? '',
  // TODO: add other env vars
  serverUrl: import.meta.env.VITE_LIVEAGORA_SERVER_URL,
  apiBase: import.meta.env.VITE_LIVEAGORA_SERVER_BASE,
}