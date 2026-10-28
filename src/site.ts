const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim() ?? ''
function validateOrigin(value: string) {
  if (!value) return ''
  const url = new URL(value)
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  ) {
    throw new Error(
      'VITE_SITE_URL must be an http(s) origin, such as https://your-domain.com, without a path, credentials, query, or fragment.',
    )
  }
  return url.origin
}
export const siteOrigin = validateOrigin(configuredOrigin)
export const sourceUrl = 'https://github.com/mavri-ai/image-ui'
