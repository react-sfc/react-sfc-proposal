# React Single File Components

Some thoughts on bringing Single File Components to React.



## Table of Contents

<!-- START doctoc -->
<!-- END doctoc -->


## Design Goals

- Stay "Close to JavaScript" to benefit from existing tooling: syntax highlighting, autocomplete/autoimport, static exports, TypeScript
- Have easy upgrade paths to go from a basic component to dynamic styles, or add state, or extract graphql dependencies
- Reduce verbosity without sacrificing readability

## In 1 image

![image](https://user-images.githubusercontent.com/6764957/89126435-3c8c9900-d518-11ea-93b2-9f2f7df14db5.png)


## Basic Proposal

Here is how we might write a React Single File Component:

```js
export const STYLE = `
    div {
      /* scoped by default */
      background-color: papayawhip;
      .Button {
        border-color: cadetblue;
      }
    }
  `

export default ({onClick}) => {
  useEffect(() => console.log('rerendered')) // no need for React import
  return (
  <div>
    Some Text
    <MyButton {...{onClick}}>
      My Call To Action
    </MyButton>
  </div>
  )
}

// I can define inline Components like normal
function MyButton({onClick}) {
  return <button className="Button" {...{onClick}}>{children}</button>
}
```

The component name would be taken from the filename. Named exports would also be externally accessible.

## Advanced Opportunities

These require more work done by the surrounding compiler/distribution, and offer a lot of room for innovation:

### Optional CSS in JS

We can switch nicely from no-runtime scoped styles to CSS-in-JS:

```js
export const STYLE = props => `
    div {
      // scoped by default
      background-color: ${props.bgColor || 'papayawhip'};
    }
  `
// etc
```

_Note: there are smaller details to sweat here with regards to passing down className, but we're staying high level for now_

### State

We can declare mutable state:

```js
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
```

<details>
<summary>
and this is transformed to the appropriate React APIs.
</summary>


```js
export default const FILENAME = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count++)}>Click {count}</button>
      <style jsx>
        {`
          button {
            // scoped by default
            background-color: ${count > 5 ? "red" : "papayawhip"};
          }
        `}
      </style>
    </>
  );
};
```

</details>


We can also do local two way binding to make forms a lot easier:


```js
let data = {
  firstName: '',
  lastName: '',
  age: undefined,
}

function onSubmit(event) {
  event.preventDefault()
  fetch('/myendpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export default () => {
  return (
    <form onSubmit={onSubmit}>
      <label>
        First Name
        <input type="text" bind:value={data.firstName} />
      </label>
      <label>
        Last Name
        <input type="text" bind:value={data.lastName} />
      </label>
      <label>
        Age
        <input type="number" bind:value={data.age} />
      </label>
      <button type="submit">Submit</button>
    </form>
  )
}
```


### GraphQL

The future of React is [Render-as-you-Fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) data, and being able to statically extract the data dependencies from the component (without rendering it) is important to avoid Data waterfalls:

```js
export const GRAPHQL = `
    query MYPOSTS {
      posts {
        title
        author
      }
    }
  `

export default function MYFILE (props, {data, status}) {
    if (typeof status === Error) return <div>Error {data.state.message}</div>
    return (
      <div>
        Posts:
        {status.isLoading() ? <div> Loading... </div>
        : (
          <ul>
            {data.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        )
        }
      </div>
    )
  }
}
```


## Why? I don't need this!

That's right, you don't -need- it. SFCs are always sugar, just like JSX. You don't need it, but when it is enough of a community standard it makes things nicer for almost everyone. SFC's aren't a required part of Vue, but they are a welcome community norm.

The goal isn't to evaluate this idea based on need. In my mind this will live or die based on how well it accomplishes two goals:

- For beginners, provide a blessed structure in a chaotic world of anything-goes.
- For experts, provide a nicer DX by encoding extremely common boilerplatey patterns in syntax.

Any new file format starts with a handicap of not working with existing tooling e.g. syntax highlighting. So a successful React SFC effort will also need to have a plan for critical tooling.

## General principle: Loaders vs SFCs

Stepping back from concrete examples to discuss how this might affect DX. In a sense, SFCs simply centralize what we already do with loaders. Instead of

```
Component.jsx
Component.scss
Component.graphql
```

we have

```js
export const STYLE // etc
export const GRAPHQL // etc
export default () => <div /> // etc
```

in a file. Why would we exchange file separation for a super long file? Although there are ways to mitigate this, it is not very appealing on its own.

However, to the extent that the React SFC loader is a single entry point to webpack for all these different filetypes, we have the opportunity to simplify config, skip small amounts of boilerplate, and enforce some consistency with the single file format. Having fewer files causes less pollution of IDE file namespace, and makes it easier to set up these peripheral concerns around jsx (styling, data, tests, documentation, etc) incrementally without messing with creating/deleting files.

## Prior art

- vue-loader:
  - https://vue-loader.vuejs.org/guide/#vue-cli
  - vue [parseComponent](https://github.com/vuejs/vue/blob/dev/src/sfc/parser.js)
  - vue compiler utils [parse](https://github.com/vuejs/component-compiler-utils/blob/master/lib/parse.ts)
  - [vue html parsing](https://github.com/vuejs/vue/blob/dev/src/compiler/parser/html-parser.js)
  - [.vue files for React](https://github.com/LukasBombach/single-file-components) by Lukas Bombach
- https://github.com/digitalie/one-loader ([HN comments](https://news.ycombinator.com/item?id=15408140))
- https://github.com/windyGex/react-template-loader (very old, uses `<template>` for some reason)
- https://github.com/LukasBombach/single-file-components
- reddit discusssions:
  - https://www.reddit.com/r/reactjs/comments/6kzqm0/is_there_a_react_equivalent_to_vues_single_file/
  - https://www.reddit.com/r/reactjs/comments/9495ft/single_file_components_no_one_misses_it/
  - every few months it pops up: https://www.reddit.com/r/reactjs/search?q=single%20file%20components&restrict_sr=1
- [JSX 2.0](https://github.com/facebook/jsx/issues/65)
- https://www.swyx.io/writing/react-distros/
- The old proposal is in [the v1 branch](https://github.com/react-sfc/react-sfc-proposal/tree/v1-Proposal).

## Am I missing some obvious idea or some critical flaw?

File an issue or PR or [tweet at me](https://twitter.com/swyx), lets chat.
