export function createId(prefix = 'id') {
  return `${prefix}-${crypto.randomUUID()}`
}
