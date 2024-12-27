---
title: Discord Markdown, Part 1
subtitle: Why It Sucks
publishDate: 2024-12-27
draft: true
---

Discord uses a form of Markdown as a markup language for formatting and styling
messages in fun and interesting ways. This is pretty cool since it lets people
**bold** or _italic_ their messages (or even **_both_**), amongst other things.
However, there is a dark side to Markdown, and it has led me down a years long
rabbit hole (of course involving Rust).

## What Is Markdown

One of the most fun aspects of Markdown is that it's not even a real standard.
Some organizations, specifically CommonMark, have attempted to develop a strong
specification to act as _the_ Markdown standard, but unfortunately tons of
different Markdown styles are still extremely common. Github, for example,
maintains its own "Github Flavored Markdown" (GFM) for use in READMEs and other
places that is notably not compliant with CommonMark. In fact, there are
relatively _few_ popular sites that use the CommonMark specification.

This lack of specification is apparently by design, since the creators of
Markdown claimed they couldn't possibly cover everyone's use-case with a strong
specification. We'll never know for certain if they were right since we're now
plagued with a million different competing standards, but their claim seems at
least somewhat supported by the fact that none of those standards have become
dominant.

![XKCD standards](https://imgs.xkcd.com/comics/standards.png)

## How Discord Uses Markdown

To make things even more exciting, Discord does not use any Markdown standard.
Unfortunately, this is for extremely good reason:

1. All Markdown standards assume a trusted environment: i.e. if you're rendering
   Markdown, you probably wrote it.
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
are some extreme subtleties: for example, one of our most notorious Markdown
bugs from the past few years was an exploit that bypassed automod by using the
Roman numeral numbering of list items to write bad words.

As a result, some sections of Discord's Markdown parser are more comment than
code and have a ton of nuanced behavior that existing standards don't consider
at all.

### Customizing Markdown

No existing Markdown specification has allowances for some of Discord's
customizations. Mentions (rendered using `<@[id]>`) and emojis (using a similar
`<:name:[id]>` syntax) are obvious and significant departures from every common
Markdown specification, but the list of customizations is much larger as Discord
has continued to expand functionality built into messages and other surfaces.

## Why This Is Bad

Discord uses `simple-markdown` under the hood, which provides a fairly sane
default set of rules and allows for reasonable customization options.
Unfortunately, `simple-markdown` uses regular expressions to define rules and,
[as with HTML](https://stackoverflow.com/a/1732454), it is not possible to parse
Markdown with regular expressions. Discord certainly tries (oh boy do we try),
but our Markdown syntax is not a regular language and therefore cannot be parsed
by a regular expression.

<details>
<summary>It's very intriguing why `simple-markdown` chose to use regular expressions in the first place</summary>

_Every_ existing Markdown specification is context sensitive, since the parser
must know which rule it is currently within in order to properly delimit child
rules.

For example, when parsing `_** foo _** bar _`, a parser would need to know that
it has descended into an italic rule such that `** foo ` is italicized rather
than entering an italic node for `** bar ` or a bold node for ` foo _`.

My guess would be that regular expressions are extremely digestible to the
average programmer, especially when compared to a full parser, and also afford
better customization opportunities. Unfortunately, this decision has led to a
flawed library.

</details>

This leads to some fairly insane regular expressions that attempt to define
various Markdown rules and results in a ton of custom logic to shoehorn some
context-sensitive behavior into a contextless parser.

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
perceptively bad decisions in software, this one was _also_ made with good
reason.

## We Need to Talk About Mobile

If you're not aware, Discord uses React Native to run on mobile devices. This
is, by and large, a reasonable decision that allows developers to iterate fairly
quickly and more easily ship new features to both platforms rather than needing
domain knowledge or waiting on someone who already has it.

Unfortunately, React Native is still pretty bad at rendering some things in a
performant way, and this is readily apparent when trying to render lists. Guess
what a channel full of messages is: go on, I bet you can get it in one.

This means that Discord's message rendering, one of the most visible surfaces of
the app, is entirely native _and_ unfortunately reliant on a _ton_ of app state
that is, you guessed it, totally irrelevant to the syntax itself.

## What This Means For Discord

Markdown is a fairly static product now, with comparatively few changes going
in. The current feature set works, and there's little in the way of features
that are missing. Unfortunately for us, the accrued and assumed technical debt
(yes, I'm mostly talking about using regular expressions to parse a non-regular
language) is still a dark ghost hauting (some of) us in our dreams.

> 37% of markdown bugs this year were P0 or P1 with nearly 1 bug per week in
> total.

Of these, quite a number were significant security flaws that resulted in either
client freezes or outright crashes: i.e. users could remotely DoS clients by
sending malicious payloads.

The maintenance burden of this is not insignificant.

## Next

soon: what we're doing about it
