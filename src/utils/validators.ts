export function isPositiveNumber(value: number) {
  return Number.isFinite(value) && value >= 0
}

export function isRequired(value: string) {
  return value.trim().length > 0
}
