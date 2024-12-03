export function useNonReactiveCopy(data) {
  return JSON.parse(JSON.stringify(data))
}