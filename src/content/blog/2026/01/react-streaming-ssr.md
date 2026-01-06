---
title: Adventures in React SSR
publishDate: 2026-01-05
---

A few months ago I wanted to stand up a new React app using a fairly modern tech
stack, but without getting deeply into the complexity of meta-frameworks like
Next.js (which, for other reasons, I've grown to dislike on its own merits). I
had no need for
[React Server Components (RSC)](https://react.dev/reference/rsc/server-components)
since my entire app needed to be reactive, so I looked for a simple Server Side
Rendering (SSR) library with streaming. It turns out that my ask was not nearly
so simple.

As the rest of the cutting edge of the React ecosystem moves on to RSC, SSR
still doesn't feel like a fully fledged feature.

- [Next.js](https://nextjs.org/) is pretty locked into RSC; although they do
  support SSR, it's taken a clear back seat to RSC.
- [Remix](https://remix.run/): what are they even doing? Apparently we're
  supposed to use React Router v7 instead of Remix.
- [React Router](https://reactrouter.com) is one of the closest libraries to
  doing what I want, but it's pretty confusing to get started with.
- While I personally love [Astro](https://astro.build/), its focus is on static
  sites and SSR is not where its strengths lie.
- [TanStack Start](https://tanstack.com/start) focuses squarely on SSR which is
  a great sign, although is still in release candidate phase.

I gave a good shot to both React Router v7 and TanStack Start, although both
ultimately didn't work out for different reasons.[^1] Thus, I embarked on a
journey to build my own SSR. How hard could it be?

[^1]:
    That said, my app architecture has changed since I tried both of them, so I
    may revisit them and see if they can cover my situation better.

## The Build System

I have some experience using Rspack at work, so I wanted to stick with what I
knew. I also knew that SSR would require multiple build environments and Vite's
environment API was not yet available on a stable release channel.

Getting Rspack to build an SSR app didn't require a ton of complicated setup,
but there were a couple pitfalls that I encountered trying to get it working.

### Fastify ♥ Rsbuild

I initially tried to put the API in the same package as the app. This might have
been OK, but I needed websocket streaming and it was impossible to setup both
Fastify's websocket plugin and Rsbuild's HMR. One of them would always win,
rather than both working at once.

Putting the API in the same package actually meant that I had _three_ build
environments: the client bundle, the server bundle that handled the SSR, and the
server itself. The latter was because of the custom Rsbuild configuration that
affected stuff like import resolution, which meant that Rsbuild had to build it.
It turned out to be way simpler to extract the API into a separate package which
has its own separate build system.

Using Fastify at all was itself somewhat complicated since Rsbuild only exposes
a connect-style middleware intended for `express` servers. Fortunately, with the
exception of the websocket issue,
[Fastify's `express` plugin](https://github.com/fastify/fastify-express) worked
without a hitch.

### Rendering the App

Rsbuild by default includes its HTML plugin since most apps mount themselves
inside a pre-rendered HTML shell. React requires that streaming SSR renders the
_entire_ HTML tree, which meant figuring out how to get the Rsbuild output
injected into the app that it was rendering. It turns out that this was pretty
easy, since Rsbuild offers a
[`manifest` option](https://rsbuild.rs/guide/advanced/ssr#get-manifest) which
will output a JSON file describing every asset that Rsbuild has emitted.

Having gotten the manifest emitted, it was a fairly simple matter of injecting
the JS assets into the `boostrapModules` option of `react-dom`'s
[`renderToPipeableStream`](https://react.dev/reference/react-dom/server/renderToPipeableStream)
function and rendering the CSS assets directly in the app's `<head>`.

## State

This was, in fact, the easy part. By this point, I had a pretty good development
experience and working, streaming SSR. We could load data using React's suspense
APIs and it would stream the resulting markup over the wire directly to the
browser. React would hydrate as soon as its module got loaded, so the page was
as reactive as it could possibly be while still incrementally streaming.

However, one piece was still missing: state. On the server, the app created a
new TS Query client and populated it with data as the renderer resolved suspense
boundaries. But, how do we get this data to the client? TS Query supports
[(de)hydrating](https://tanstack.com/query/latest/docs/framework/react/reference/hydration)
its query client, so this was the initial approach I took.

### Streaming the Query Client

At this point, I'd followed the documentation of `renderToPipeableStream` that
suggested starting the stream when the `onShellReady` callback is called.

> `onShellReady`: A callback that fires right after the initial shell has been
> rendered. You can set the status code and call pipe here to start streaming.
> React will stream the additional content after the shell along with the inline
> `<script>` tags that replace the HTML loading fallbacks with the content.

However, the shell is going to be ready well before all of the query data is
available in the query client for dehydration. Thus, I setup an `onAllReady`
callback that dehydrated the query client and wrote a script tag directly to the
reply stream that set the encoded and dehydrated query client as a property on
the window. When the main app module got loaded, it would check for this
property and dehydrate the query client from it.

> `onAllReady`: A callback that fires when all rendering is complete, including
> both the shell and all additional content. You can use this instead of
> `onShellReady` for crawlers and static generation. If you start streaming
> here, you won’t get any progressive loading. The stream will contain the final
> HTML.

This worked for toy implementations, but the astute reader has probably figured
out that this approach is prone to race conditions since the main module could
be loaded in any order relative to the React stream being complete. In fact, one
could expect that, for every non-trivial case, the main module would load
_before_ the dehydrated query client is available.

### Hydration Is Impossible

What I in fact need here is streaming hydration for TS Query clients.
Interestingly, TS Query is actually building this in the form of
`@tanstack/react-query-next-experimental`, but it's clearly still extremely
experimental and has no documentation at this point. It's also clearly targeted
at Next.js, which is a bit unfortunate since I do not intend to use Next.js.

There are, in fact, no existing solutions for this. Even if we exclude TS Query,
every other state management library has no mechanism for streaming its state
from the server. While React's suspense is tantalizingly close to being helpful
here by streaming its children's props as they resolve, this unfortunately does
nothing if you rely on centralized state management.

It's entirely possible to serialize Flux, Zustand, Jotai, or any store really,
and then rehydrate that state on the client. It's just that, to do so properly,
you need to somehow inject the serialized state into React's HTTP stream.

## What's Next

Whether the meta-frameworks take this approach or are doing their own streaming,
I'm not interested in digging so deeply into the React fundamentals to solve
this problem for myself.

React would probably say to use component props with suspense, but this _only_
works from the perspective of RSC where you can follow
[their example](https://react.dev/reference/react/use#streaming-data-from-server-to-client)
and create the promise on the server to pass it through to the client. It's
completely untenable to take this approach in an SSR world where the parent
component can get re-rendered arbitrarily and would create a new promise every
time.

Aside from this RSC-centric approach, React offers no solution. Thus, we're back
to a bespoke solution crafted by one of the meta-frameworks. I may give some of
them another go, although I'm not particularly excited about the options on the
table.
