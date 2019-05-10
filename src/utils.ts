/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
export function makeMap(str: string, expectsLowerCase?: boolean) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? (val: string) => map[val.toLowerCase()]
    : (val: string) => map[val]
}
