---
title: Discord Music Presence
publishDate: 2025-07-27
---

A few years ago, I switched off of Spotify because I was less than impressed
with their endorsement of Joe Rogan. I went with TIDAL for their lack of being
Spotify, and I've been happy with their service (and lack of Joe Rogan) ever
since. However, I've been missing one thing from my Spotify days: Discord
presence.

Discord's Spotify integration is super custom and impossible to replicate
without partnering directly with TIDAL. However, we can get fairly close with
[Discord's RPC server](https://discord.com/developers/docs/topics/rpc). RPC is a
bit of a well-known secret in the community; although it's marked as "private
beta" in the documentation, the documentation actually only covers the WebSocket
transport (which is indeed in private beta and inaccessible to most apps).
However, there's a secret ~~third~~ second option that uses IPC as the transport
layer, and this transport layer is totally open for any app to use but remains
(as-yet) undocumented. There are some subtle differences in functionality, but
it's perfectly adequate for the simple task of setting presence activity.

## Connecting to Discord

Many years ago, [devsnek](https://github.com/devsnek) wrote the
[`discord-rpc`](https://github.com/discordjs/RPC) client library which served as
a reasonable reference implementation for my purposes. The protocol is super
simple: the first 4 bytes represent the op code, the next 4 bytes represent the
length of the payload, and the remaining bytes are the payload in JSON format
([my implementation](https://github.com/appellation/music-rpc/blob/8689f93c70708512bddcb431060bcc605eca4a3a/src-tauri/src/rpc/codec.rs#L65-L84)).
This protocol applies bidirectionally.

Negotating with the client is also not super complicated, and the official RPC
docs are actually super useful for this because it works the same way. After
requesting to authorize, the user is redirected to their Discord app where they
can choose to allow the app to access their account. The app then goes through
the regular OAuth2 flow to exchange the code with a regular access token. At
this point, we're fully connected to the Discord app and can perform most RPC
operations. Specifically, we're concerned about the
[`SET_ACTIVITY`](https://discord.com/developers/docs/topics/rpc#setactivity)
command, which will let our application set the user's activity.

## Connecting to Music

Although my primary goal was getting playback information out of TIDAL, they do
not expose any API which allows this. Ironically, they provide an SDK dedicated
to making an entire custom TIDAL _player_ but they have no way of interacting
with their own player. I was uninterested in re-implementing TIDAL, so I began
digging for alternatives.

[musicpresence.app](https://musicpresence.app/) is the leading solution which
does this today. I nearly ended my search here, since it does exactly what I
want out of the box. However, it's closed source and I was still interested in
trying to solve this problem anyway.

Although I didn't use it directly, Music Presence did give me a line on pulling
playback information directly from the operating system (something I'd
completely forgotten about). Since my personal machine is Windows, I got
cracking and had a working solution up very quickly. Although the Windows API is
relatively confusing and not without its quirks, the
[Windows Rust SDK](https://microsoft.github.io/windows-docs-rs/doc/windows/) is
very good and it's trivial to access this information with just a few syscalls.

### MacOS

However, my work machine is a Mac and macOS is notorious for locking things
down. Music playback information is no exception and, at the time I was writing
the initial version of this app, it was only available via the reverse
engineered `MediaRemote` framework. It took me a bit longer to get something
working on macOS since directly calling Objective C functions is a bit more
complex than using the pre-built Windows crate, but I did eventually get the app
linked to the `MediaRemote` framework and pulling data from it.

I figured I was done; I had a simple app that worked on both Windows and macOS.
However, my success was short-lived: with the release of macOS 15.4, Apple did
what Apple does best and ruined the fun by making the `MediaRemote` framework
fully private[^1], only accessible by internal approved applications.

I gave up, figuring that the effort of getting this working on macOS would be
too great. While having something on Windows would be useful, I actually spend
most of my listening time on macOS and it wouldn't be super helpful.

## Perl to the Rescue

Months passed and my curiosity got the better of me. Chatting about the issues
I'd been having, I was pointed towards
[`ungive/mediaremote-adapter`](https://github.com/ungive/mediaremote-adapter)
(authored by the same person building Music Presence) and noticed that they'd
solved the macOS issue.

> This works by using a system binary – `/usr/bin/perl` in this case – which is
> entitled to use the MediaRemote framework and by dynamically loading a custom
> helper framework that prints real-time updates to stdout.

It's fairly cursed, but it's a fully functional solution for getting media
playback information from macOS.

Reinspired, I picked up the project again and finally finished a robust solution
for both macOS and Windows. My solution is open sourced
[on GitHub](https://github.com/appellation/music-rpc), although it certainly
wouldn't be possible without the legends that came before: shoutout to ungive
for such a creative solution to pulling playback information from macOS.

[^1]: https://github.com/ungive/discord-music-presence/issues/165
