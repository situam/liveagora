// TODO: better env schema

export const Env = {
  isCommunityVersion: import.meta.env.VITE_IS_COMMUNITY_VERSION === 'true',
  docNamespace: import.meta.env.VITE_DOC_NAMESPACE ?? '',
  // TODO: add other env vars
}