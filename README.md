# React Single File Components

Some thoughts on bringing Single File Components to React.

## Why? I don't need this!

That's right, you don't -need- it. SFCs are always sugar, just like JSX. You don't need it, but when it is enough of a community standard it makes things nicer for almost everyone. SFC's aren't a required part of Vue, but they are a welcome community norm.

The goal isn't to evaluate this idea based on need. In my mind this will live or die based on how well it accomplishes two goals:

- For beginners, provide a blessed structure in a chaotic world of anything-goes.
- For experts, provide a nicer DX by encoding extremely common boilerplatey patterns in syntax.

Any new file format starts with a handicap of not working with existing tooling e.g. syntax highlighting. So a successful React SFC effort will also need to have a plan for critical tooling.

## Prior art

- https://vuejs.org/v2/guide/single-file-components.html
- https://github.com/digitalie/one-loader ([HN comments](https://news.ycombinator.com/item?id=15408140))
- https://github.com/windyGex/react-template-loader (very old, uses `<template>` for some reason)
- reddit discusssions: 
  - https://www.reddit.com/r/reactjs/comments/6kzqm0/is_there_a_react_equivalent_to_vues_single_file/
  - https://www.reddit.com/r/reactjs/comments/9495ft/single_file_components_no_one_misses_it/
  - every few months it pops up: https://www.reddit.com/r/reactjs/search?q=single%20file%20components&restrict_sr=1
  
## Basic Proposal

All tags within SFCs would be extensible, but come with some good defaults.

```vue
<style>
div { // scoped by default
  background-color: papayawhip
  .Button {
    border-color: cadetblue;
  }
}
</style>
<jsx>
  export default function() {
    return (
    <div>
      Some Text
      <button className="Button">Call to Action</button>
    </div>
    )
  }
</jsx>
```

The styles can be compiled to CSS modules or Linaria or some similar no-runtime alternative.

## Not just styles

The point 
