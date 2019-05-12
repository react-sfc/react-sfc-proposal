---
route: 2019-09-11-highlighting-and-styling
published: true
description: exploring how syntax highlighting works
---

## Follow up

i saw engagement from two projects on my last tweet:

- linaria
- reshadow: https://twitter.com/_lttb/status/1127122264066023425 which does a component shadowy api like i do

## Syntax highlighting

and this guy had a very good point: https://twitter.com/jonathanvoelkle/status/1126878312725458944

so all i did was edit the associations:

```json
"files.associations": {
    "*.sfc": "html"
  },
```

and it works! https://twitter.com/swyx/status/1127345849472884736

lol i didnt need to do anything in the end.

## Style syntax

so now i have to think about whether I want to have some confusing custom style syntax or just always adopt the css in js approach. Because i keep looking it up, here are the various npm trends:

- https://www.npmtrends.com/styled-jsx-vs-styled-components-vs-glamorous-vs-emotion-vs-@emotion/core
- https://npmcharts.com/compare/glamor,aphrodite,radium,glamorous,styled-components,jss,emotion,linaria

---

i explored using the original proposed style tag for runtime-css-in-js, but prettiering doesnt work on it, and i'm not sure how i want to actually implement it:

```js
<style lang="styled-components">
  div {
    background-color: ${({theme}) => theme.bgColor}
    ${props.isActive && `
      .Button {
        border-color: cadetblue;
      }
    `
    }
  }
</style>
```

I can basically take its contents and wrap it around the default JSX output. i do also worry about the typescript story.

---

spent some time thinking about what i really want to support. reading this: https://github.com/styled-components/styled-components/issues/2377 is very convincing in favor of SC.

---

looked into https://styled-system.com/ a bit.

---

the more i think about it, the more i should just build in styles by wrapping. right now what i do is:

```
                               ┌────────────────────────────┐
                               │                            │
                               │  Current SFC architecture  │
                               │  (inspired by Vue-loader)  │
                               │                            │
                               └────────────────────────────┘
┌───────Webpack───────┐                                        ┌─────────Webpack──────────┐
│   inline modules    │                                        │       build output       │
│            ┌──────┐ │  ┌──────────────────┐                  │                  ┌──────┐│
│            │      │ │  │                  │                  │                  │      ││
│         ┌─▶│  JS  │─┼─▶│ componentWrapper │─────────┐        │               ┌─▶│  JS  ││
│ ┌─────┐ │  │      │ │  │                  │         │        │┌───────────┐  │  │      ││
│ │     │ │  └──────┘ │  └──────────────────┘         │        ││           │  │  └──────┘│
│ │ SFC │─┤           │                               └───────┬▶│  loaders  │──┤          │
│ │     │ │  ┌──────┐ │  ┌──────────────┐    ┌──────────────┐ │││           │  │  ┌──────┐│
│ └─────┘ │  │      │ │  │              │    │              │ ││└───────────┘  │  │      ││
│         └─▶│ CSS  │─┼─▶│ wrappedStyle │───▶│    postCSS   │─┘│               └─▶│ CSS  ││
│            │      │ │  │              │    │              │  │                  │      ││
│            └──────┘ │  └──────────────┘    └──────────────┘  │                  └──────┘│
└─────────────────────┘                                        └──────────────────────────┘
```

it seems that if i make one compromise, which is not allowing users to add their own loaders on top of the ones i provide, i dont really need the webpack modules at all. I can leave everything in JS.

```
                       ┌────────────────────────────┐
                       │                            │
                       │  simpler SFC architecture  │
                       │    (HOC all the things)    │
                       │                            │
                       └────────────────────────────┘
┌───────Babel or Webpack glue───────┐
│                                   │
│            ┌──────┐               │
│            │      │               │    ┌─────────Webpack──────────┐
│         ┌─▶│  JS  │───┐           │    │       build output       │
│         │  │      │   │           │    │                  ┌──────┐│
│         │  └──────┘   │           │    │                  │      ││
│         │             │           │    │               ┌─▶│  JS  ││
│ ┌─────┐ │  ┌──────┐   │   ┌──────┐│    │┌───────────┐  │  │      ││
│ │     │ │  │      │   │   │      ││    ││           │  │  └──────┘│
│ │ SFC │─┼─▶│ CSS  │───┼──▶│  JS  │├────▶│  loaders  │──┤          │
│ │     │ │  │      │   │   │      ││    ││           │  │  ┌──────┐│
│ └─────┘ │  └──────┘   │   └──────┘│    │└───────────┘  │  │      ││
│         │             │           │    │               └─▶│ CSS  ││
│         │  ┌───────┐  │           │    │                  │      ││
│         │  │       │  │           │    │                  └──────┘│
│         └─▶│GraphQL│──┘           │    └──────────────────────────┘
│            │       │              │
│            └───────┘              │
│                                   │
└───────────────────────────────────┘
```
