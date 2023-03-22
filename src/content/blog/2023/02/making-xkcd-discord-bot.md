---
title: Making an XKCD Discord Bot
publishDate: 2022-02-25
---

Have you ever been peacefully conversing on Discord and needed to react with an
XKCD comic, but then you had to switch contexts to a web search and then parse
the shitty search results for the actual XKCD comic and then visit the page and
then make sure it's the right comic and then finally copy/paste the XKCD comic
URL into your chat?

Well, I have, and I assure you that it's not as glamorous as it sounds. Given
the severity of this issue, I took immediate action to integrate XKCD comics
directly into Discord so you never have to suffer through this pain again.

<details><summary>TL;DC</summary>

If you couldn't care less about actually making your own XKCD Discord bot and
are just here for the one I've already made, go ahead and just [add my bot to
your
server](https://discord.com/api/oauth2/authorize?client_id=1064660696668844072&scope=applications.commands).
I hope you enjoy exploiting software engineers.

Also, why are you even here? On a blog post about making an XKCD Discord bot??

</details>

## Phase 1: Ingesting XKCD

Comics are usually designed for humans to consume, not computers, and so
oftentimes reading them with machines requires web scraping and other horrors.
Fortunately, XKCD publishes a rudimentary JSON API.

```bash
curl https://xkcd.com/info.0.json
```

This gives us some nice JSON with information about the latest comic. It even
includes the alt text, which is like half of the comic anyway.

```json
{
  "month": "2",
  "num": 2742,
  "link": "",
  "year": "2023",
  "news": "",
  "safe_title": "Island Storage",
  "transcript": "",
  "alt": "I always hate dragging around the larger archipelagos, but I appreciate how the Scandanavian peninsula flexes outward to create a snug pocket for the British Isles.",
  "img": "https://imgs.xkcd.com/comics/island_storage.png",
  "title": "Island Storage",
  "day": "24"
}
```

More importantly, it includes the number of this comic. We can use this to pull
in _all_ of the previous XKCD comics, back to 1. Let's try this with the
previous comic.

```bash
curl https://xkcd.com/2741/info.0.json
```

Look at that: we did it! The `n-1` comic is ours!

```json
{
  "month": "2",
  "num": 2741,
  "link": "",
  "year": "2023",
  "news": "",
  "safe_title": "Wish Interpretation",
  "transcript": "",
  "alt": "\"I wish for everything in the world. All the people, money, trees, etc.\" \"Are you SURE you--\" \"And I want you to put it in my house.\"",
  "img": "https://imgs.xkcd.com/comics/wish_interpretation.png",
  "title": "Wish Interpretation",
  "day": "22"
}
```

We can just repeat this, decrementing the comic number down to 1, and now we
have access to the entire XKCD archive. Note that XKCD is incredibly humorous
and comic number 404 doesn't exist.

## Phase 2: Digesting XKCD

Now that we have a strategy for pulling in all XKCD comics, we need to actually
do something with them. It's one thing to allow people to look up comics by
their number, but that's incredibly unhelpful and hardly an improvement over
where we started.

That leaves us with implementing some kind of search solution. Text search isn't
a super trivial problem, as evidenced by the market cap of Alphabet, but
fortunately we are on a very small scale with only several thousand documents.

There are many free and open source search engines out there, the most popular
of which is Elasticsearch. Having never used it and being more of a Rust person
myself, I elected to use [Meilisearch](https://www.meilisearch.com/). They even
have a Rust SDK.

After loading the comics using our previous strategy, it's a simple matter of
adding them to a Meilisearch index.[^1]

[^1]: Meilisearch indexing:
    https://github.com/appellation/xkcd-bot/blob/176bad13a5635cb6167ff0fbc641ab725a05e5b9/indexer/src/lib.rs#L78-L81

```rust
use anyhow::Result;
use meilisearch_sdk::Client;

async fn index_comics(client: &Client) -> Result<()> {
  let comics = load_comics().await?;

  let task = client
    .index("comics")
    .add_documents(&comics, Some("num"))
    .await?;

  client.wait_for_task(task, None, None).await?;
}
```

### Regularly Digesting XKCD

XKCD is still active, and unfortunately our ingestion strategy won't tell us
when a new comic comes out. This is unacceptable, but fortunately comes with a
fairly simple solution.

There's a cool Rust crate called [`clokwerk`](https://docs.rs/clokwerk/) which
allows us to schedule this ingestion process on a regular interval. This example
shows a cadence of every day at 1am, but it's super configurable and easy to
change.[^2]

[^2]: Clokwerk:
    https://github.com/appellation/xkcd-bot/blob/176bad13a5635cb6167ff0fbc641ab725a05e5b9/indexer/src/main.rs#L18-L34

```rust
use clokwerk::{AsyncScheduler, Job, TimeUnits};
use meilisearch_sdk::Client;

let mut scheduler = AsyncScheduler::new();
let client = Client::new("http://meilisearch", "api key");

scheduler.every(1.day()).at("1:00 am").run(move || {
  let client = client.clone();
  async move {
    index_comics(&client).await.unwrap();
  }
});

loop {
  scheduler.run_pending().await;
  sleep(Duration::from_millis(500)).await;
}
```

We simply need to deploy this as a separate service that mostly loops and sleeps
until the moment we've all been waiting for (1am), at which point it will update
our search index. Forever.

### Ranking Digestion

Unfortunately, if we search with an empty query, we get a random assortment of
comics rather than the freshest 👌. In order to make Meilisearch fall back to
ordering by comic number, it's a simple matter of updating the Meilisearch
ranking rules.[^3] [^4]

[^3]: Defining ranking rules:
    https://github.com/appellation/xkcd-bot/blob/176bad13a5635cb6167ff0fbc641ab725a05e5b9/indexer/src/lib.rs#L9-L17
[^4]: Setting ranking rules:
    https://github.com/appellation/xkcd-bot/blob/176bad13a5635cb6167ff0fbc641ab725a05e5b9/indexer/src/lib.rs#L83-L84

```rust
const RANGKING_RULES: [&'static str; 7] = [
	"words",
	"typo",
	"proximity",
	"attribute",
	"sort",
	"exactness",
	"num:desc",
];

let task = client
  .index("comics")
  .set_ranking_rules(&RANKING_RULES)
  .await?;

client.wait_for_task(task, None, None).await?;
```

### Optimizing XKCD Digestion

You might realize by this point that we're doing a _lot_ of unnecessary work.
XKCD doesn't publish super frequently, and they certainly don't change any of
their previous comics. Reindexing all of them every day is several thousand
documents that we don't need to process.

Fortunately, Meilisearch to the rescue! Since we've ordered our comics, we can
just pull the first one and use it to determine how up-to-date we are.[^5]

[^5]: Getting the most recently indexed comic:
    https://github.com/appellation/xkcd-bot/blob/176bad13a5635cb6167ff0fbc641ab725a05e5b9/indexer/src/lib.rs#L69-L76

```rust
let start_num = client
  .index("comics")
  .get_documents_with::<Comic>(DocumentsQuery::new(&comics_idx).with_limit(1))
  .await
  .map(|DocumentsResults { results, .. }| results)
  .unwrap_or(vec![])
  .get(0)
  .map(|comic| comic.num)
  .unwrap_or(1);
```

Now, since `start_num` defaults to 1 if there are no comics indexed, we can
simply fetch all of the comics between the latest comic and `start_num`.

## Phase 3: Excreting XKCD

Now we can actually build our Discord integration. Fortunately, all the hard
work has already been done for us...by us (perhaps we should rethink this
strategy).

First, we should [make a Discord
bot](https://discord.com/developers/applications) if we haven't already. Once we
have a bot, we need to register a slash command that we can use to fetch XKCD
comics. I used my [interactions website](https://interactions.wnelson.dev) to do
this conveniently with a UI, but you can also just cURL it.

```bash
curl -X POST \
	-H "Content-Type: application/json" \
	-d '{"type": 1, "name": "xkcd", "description": "Get an XKCD comic.", "options": [{"required": true, "type": 3, "name": "query", "autocomplete": true, "description": "Query to search for."}]}'
```

Let's add our bot to a Discord server (with the `applications.commands` scope)
and set it up to receive interactions[^6].

[^6]: Interaction handler:
    https://github.com/appellation/xkcd-bot/blob/176bad13a5635cb6167ff0fbc641ab725a05e5b9/bot/src/main.rs#L64-L90

> I'll leave this as an exercise for the reader, since this process is already
> [well-documented](https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction).

Our bot needs to be able to handle 2 different interaction types:

1. Autocomplete search queries
2. The slash command interaction

### Handling Autocomplete Search Queries

Loading search results from Meilisearch is incredibly easy.[^7]

[^7]: Searching for comics:
    https://github.com/appellation/xkcd-bot/blob/176bad13a5635cb6167ff0fbc641ab725a05e5b9/bot/src/main.rs#L98-L104

```rust
let results = client
	.index("comics")
	.search()
	.with_query(query)
	.with_limit(20)
	.execute::<Comic>()
	.await?;
```

Unfortunately, Discord does not offer any way to display search results other
than text. While it would be nice to show the actual image, we're limited to
just the information we've indexed in Meilisearch. I elected to return the comic
number and title.[^8]

[^8]: Responding with comic search results:
    https://github.com/appellation/xkcd-bot/blob/176bad13a5635cb6167ff0fbc641ab725a05e5b9/bot/src/main.rs#L113-L117

```rust
CommandOptionChoice {
	name: format!("{}: {}", result.num, result.title),
	value: CommandOptionChoiceValue::String(result.num.to_string()),
	name_localizations: None,
}
```

### Handling the Slash Command Interaction

Once the user selects a search result, displaying the XKCD comic itself is easy.
While we can go through the effort of building our own custom embed, XKCD URLs
embedded in Discord already look excellent and contain all of the information we
could want to display.

By specifying the comic number as the `value` in the `CommandOptionChoice` when
responding to the search queries, we can simply interpolate it into a normal
XKCD URL and respond with that.[^9]

[^9]: Responding with selected comic:
    https://github.com/appellation/xkcd-bot/blob/176bad13a5635cb6167ff0fbc641ab725a05e5b9/bot/src/main.rs#L127

```rust
format!("https://xkcd.com/{}/", value);
```

## Phase 4: Ingesting XKCD

Now we can ingest the excreted XKCD at our leisure.

![Result of running our new XKCD command.](/assets/blog/2022/02/xkcd.PNG)

If you don't want to go through the trouble of setting up all of the
infrastructure to support this (there are at least 2 services, preferably _3_
😨), I've already done all of the hard work here and I'm hosting my own XKCD bot
that is public. Feel free to [add it to your
servers](https://discord.com/api/oauth2/authorize?client_id=1064660696668844072&scope=applications.commands)!
