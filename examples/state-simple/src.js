let count = 0

export const STYLE = `
    button {
      // scoped by default
      background-color: ${count > 5 ? 'red' : 'papayawhip'};
    }
  `

export default () => {
  return <button onClick={() => count++}>Click {count}</button>
}