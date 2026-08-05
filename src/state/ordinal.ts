const ORDINALS = ['1er', '2ème', '3ème', '4ème', '5ème', '6ème', '7ème', '8ème', '9ème']

export function formatOrdinal(position: number): string {
  return ORDINALS[position - 1] ?? `${position}ème`
}
