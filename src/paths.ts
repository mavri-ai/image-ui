export const basePath = import.meta.env.BASE_URL
export function publicPath(path: string) {
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    basePath === '/' ||
    path === basePath.slice(0, -1) ||
    path.startsWith(basePath)
  )
    return path
  return basePath + path.slice(1)
}
export function routePath(path: string) {
  const local =
    basePath !== '/' && (path === basePath.slice(0, -1) || path.startsWith(basePath))
      ? path.slice(basePath.length - 1)
      : path
  return local.replace(/\/+$/, '') || '/'
}
