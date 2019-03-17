/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
// export function makeMap(str: string, expectsLowerCase?: boolean): (key: string) => true | void {
export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null)
  // const list: Array<string> = str.split(',')
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}
