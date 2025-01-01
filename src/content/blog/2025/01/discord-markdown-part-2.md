---
title: Discord Markdown
subtitle: "Part 2: What We're Doing About It"
publishDate: 2025-01-01
draft: true
---

> This is a continuation from [part 1](/blog/2024/12/discord-markdown-part-1).

The current situation is not salvageable: regular expressions are fundamentally
incompatible with parsing Markdown. For Discord's purposes (and anyone's,
really), we decided that an actual proper parser was necessary: mostly so that
we could replace the cursed regular expression and "parser" logic with some more
understandable, declarative code.

We also wanted to disentangle some of the UI state from parser state so that
business logic in the Discord apps would be more abstracted to the relevant
components. Doing so was most easily achieved by making the parser into a
standalone library that _could not_ access any UI state, which in turn opened
the possibility for Discord to publish the parser as a library for third parties
to consume. Once the parser is actually used in Discord, it is my goal to open
source the parser[^1] for this purpose: however, for now it remains closed
source to avoid confusion.

[^1]: This is not a guarantee that Discord will open source the library.

We chose to explicitly not support any sort of extensibility or anything beyond
Discord's specific requirements. In the wise words of John Gruber, "...different
sites (and people) have different needs..."[^2] and we don't expect or want
anyone else to extend Discord's Markdown language. Making it pluggable would be
a maintenance burden we don't want for a gain we won't see.

[^2]: https://x.com/gruber/status/507670720886091776

## Rust? Rust.

Obviously, we chose Rust because Rust.

> OK, there is actually a bit of nuance to this decision, but in our case Rust
> does actually make a lot of sense.

Most critically, Rust can be compiled to WebAssembly with relative ease. This
makes integrating Rust libraries with Discord's web apps fairly trivial.
Furthermore, Rust can be compiled to a myriad of other targets which enables us
to use it on basically any platform (including mobile 👀); we just compile to
machine code with some runtime bindings as necessary. Using native machine code
also has the potential to greatly improve performance.

This is true of many other native languages, but Rust is already
well-established at Discord and I personally just enjoy using it. Plus, Rust. 🚀

## We Need To Talk About Mobile (Again)

While we could use a JavaScript parser on mobile due to React Native (and,
indeed, doing so comes with some dubious benefits)[^3], a native module would
likely improve mobile performance considerably. Aside from some of the
previously discussed performance issues with regular expressions, one of the
main bottlenecks in message rendering is actually serializing the AST across the
React Native bridge.

[^3]:
    As discussed in part 1, parsing in JavaScript allows us to hydrate the AST
    with UI state. This is not _good_ but is is oh so convenient.

React Native actually just replaced the bridge with their
["New Architecture"](https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here),
which would likely address most if not all of Discord's issues with the bridge.
However, since the New Architecture is only a few months old, Discord hasn't had
an opportunity to upgrade to it. Furthermore, fully migrating off of the bridge
is likely to be a significant amount of effort due to the differences in how
things work. That said, the benefits of upgrading are considerable and there is
strong appetite internally to do so.

Since we're already looking at leveraging the New Architecture, this offers an
excellent opportunity to integrate a new native library. Rust saves us yet
again, since, as a native language, it's fairly easy to bind to native mobile
ABIs. Furthermore, we can largely avoid interacting with the AST _at all_ from
JavaScript land since the message renderer can directly call the native
module.[^4] The exact mechanisms for doing so remain as yet unknown and will
likely be the subject of a future blog post.

[^4]:
    This isn't entirely true. The attentive reader may remember from part 1 that
    Discord hydrates the AST with a bunch of UI state so that mobile has enough
    information to render friendly messages. If we're obtaining the AST directly
    in native land, we will still need some way to obtain this UI state unless
    we want to render mentions with just the user ID.

## Enter, Discord API

The apps are not the only place that Discord parses markdown: there isn't a lot
of Markdown parsing in the API, but there is _some_ and some is more than none.
Mostly this parsing is to detect links for unfurling, but it's also used in a
few other places. Critically, however, the API is _not_ written in JavaScript
and thus uses an entirely separate parser: if you've ever noticed that
`discord.com` links unfurl if they are succeeded by punctuation, this is because
of the different Markdown parsers that Discord uses on frontend and backend.

Fortunately, Rust saves us yet again. It's fairly trivial to build a Rust
library into a Python module, which solves this problem fairly easily. Due to
the limited amount of use in the API, the integration process should™ be fairly
straightforward (at least relative to the apps).

## Native Code Go Brrrr

In summary, Rust. 🚀

Unironically, though, Discord desperately needs to revamp its Markdown parsing
system and Rust helps us do this while improving performance, correctness, and
portability. Now, we just need to build the thing and integrate it into Discord;
how hard could it be?

## Next

soon: how we did it
