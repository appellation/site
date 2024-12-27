---
title: Discord Markdown
subtitle: "Part 1: Why It Sucks"
publishDate: 2024-12-27
---

Discord uses a form of Markdown as a markup language for formatting and styling
messages in fun and interesting ways. This is pretty cool since it lets people
**bold** or _italic_ their messages (or even **_both_**), amongst other things.
However, there is a dark side to Markdown, and it has led me down a years long
rabbit hole involving Rust, regular expressions, and some very cursed React.

## What Is Markdown

One of the most fun aspects of Markdown is that it's not even a real standard.
Some organizations, specifically [CommonMark](https://commonmark.org/), have
attempted to develop a strong specification to act as _the_ Markdown standard,
but unfortunately tons of different Markdown styles are still extremely common.
GitHub, for example, maintains its own
["GitHub Flavored Markdown" (GFM)](https://github.github.com/gfm/) for use in
READMEs and other places that is notably an extension of CommonMark rather than
strictly compliant.

This lack of specification is by design since the original creator of Markdown,
John Gruber, claimed he couldn't possibly cover everyone's use-case with a
single specification.[^1] Indeed, Gruber had some beef with the original
implementation of CommonMark for naming the project "Standard Markdown" and he
required them to omit "Markdown" from their project name entirely.[^2] We'll
never know for certain if Gruber was right since we're now plagued with a
million different competing standards, but his claim seems at least somewhat
supported by the fact that none of those standards have obviously won the war.

[^1]: https://x.com/gruber/status/507670720886091776

[^2]: https://blog.codinghorror.com/standard-markdown-is-now-common-markdown/

![XKCD standards](https://imgs.xkcd.com/comics/standards.png)

## How Discord Uses Markdown

To make things even more exciting, Discord does not use any pre-existing
Markdown standard. Unfortunately, this is for extremely good reason:

1. Most Markdown standards assume a trusted environment: i.e. if you're
   rendering Markdown, you probably wrote it.
2. Discord has a _ton_ of customizations to the Markdown syntax to support
   things like mentions and custom emojis.

Discord does stick to the basics like `**` to bold text or `_` to italicize it,
but the differences are vast past these trivial tokens.

### Rendering Untrusted Code

This is, essentially, how every Discord message works. Any user, who you may or
may not trust, can send you some code that is then rendered on your screen. The
opportunities for malicious exploits abound, and not all of them incredibly
obvious. Most Markdown specifications allow you to just embed HTML directly in
your markup, which is obviously not great for obvious reasons. However, there
are some more extreme subtleties: for example, one of our most notorious
Markdown bugs from the past few years was an exploit that bypassed automod by
using the Roman numeral numbering of list items to write bad words.

As a result, some sections of Discord's Markdown parser are more comment than
code and have a ton of nuanced behavior that existing standards don't consider
at all.

### Customizing Markdown

No existing Markdown specification has allowances for some of Discord's
customizations. Mentions (rendered using `<@id>`) and emojis (using a similar
`<:name:id>` syntax) are obvious and significant departures from every common
Markdown specification, but the list of customizations is much larger as Discord
has continued to expand functionality built into messages and other surfaces.

## Why This Is Bad

Discord uses [`simple-markdown`](https://www.npmjs.com/package/simple-markdown)
under the hood, which provides a fairly sane default set of rules and allows for
reasonable customization options. Unfortunately, `simple-markdown` uses regular
expressions to define rules and,
[as with HTML](https://stackoverflow.com/a/1732454), it is not possible to parse
Markdown with regular expressions. Discord certainly tries (oh boy do we try),
but Markdown is not a regular language and therefore cannot be parsed by a
regular expression.

It's noteworthy that the _entire_ parser is not defined with regular expressions
and thus avoids the inherent impossibility of the task: regular expressions are
used to capture portions of the input which is then subsequently parsed by code.
However, there is considerable nuance around how captured input interacts with
other rules and, in many places, Discord is required to implement some very
insane parsing behavior in order to maintain safety and consistency.

This leads to some fairly insane regular expressions and results in a ton of
custom logic to shoehorn context-sensitive behavior into an otherwise
contextless parser.

## How Discord Markdown Evolved

You may not really think about it, but Discord is _old_: coming up on 10 years
old. Not all of this time has been using `simple-markdown` (the library itself
is only 7 years old) and indeed Discord's prior Markdown iterations are beyond
the scope of my lore knowledge.

Regardless, Discord's age is unfortunately apparent in the evolution of its
Markdown parsing; custom rules abound and there are a truly insane amount of
ways that one can parse and render Markdown content, often with subtly (or not)
different rules based on the surface. If you're ever wondering why some surface
in the Discord client supports some specific Markdown but a different surface
does not, it is likely either hacked together by design or unintentionally
complex by accident.

This has led to some _very fun_ "features" of Markdown parsing, specifically
that the parser is _highly_ stateful on things that are totally irrelevant to
parsing the syntax itself. For example, when parsing timestamps, the parser
_pre-hydrates_ the AST with business logic about the timestamp itself.

This is...well...not super great, especially if you're a language purist but
even just from a code maintenance perspective. Unfortunately, as with most
perceptively bad decisions in software, this one was _also_ made with at least
some good reason.

## We Need to Talk About Mobile

If you're not aware, Discord uses React Native to run on mobile devices.
Unfortunately, React Native is still pretty bad at rendering some things in a
performant way, and this is readily apparent when trying to render lists.

This means that Discord's message rendering, one of the most visible surfaces of
the app, is entirely native and unfortunately reliant on a _ton_ of app state
that is, you guessed it, totally irrelevant to the syntax itself.

Thus, a good chunk of Discord's impure and stateful Markdown parsing is actually
in service of getting data across the JavaScript-native bridge for the native
chat layer to render. This is what powers things like rendering formatted
timestamps instead of the Unix timestamp or the user/nickname instead of the
user ID.

## What This Means For Discord

Markdown is a fairly static product now, with comparatively few changes going
in. The current feature set largely works, and there's little in the way of
features that are missing. Unfortunately for us, the accrued and assumed
technical debt (yes, I'm mostly talking about using regular expressions to parse
a non-regular language) is still a dark ghost hauting (some of) us in our
dreams.

> 37% of markdown bugs in 2024 were P0 or P1, with nearly 1 bug per week
> overall.

Of these, quite a number were significant security flaws that resulted in either
client freezes or outright crashes: i.e. users could remotely DoS clients by
sending malicious payloads.

The maintenance burden of this is not insignificant.

## Next

soon: what we're doing about it
