---
title: "Redis Client, Part 1: Parsing RESP"
publishDate: 2023-04-01
---

The Redis Serialization Protocol is designed to be an incredibly simple binary
networking protocol. Incidentally, it is also used to communicate with Redis
servers over TCP.

While RESP itself is incredibly simple, the rest of the Redis connection
lifecycle is surprisingly complex and an ergonomic API is deceptively
challenging to make.

1. Establishing a TCP connection with Redis
2. Sending and receiving bytes from the TCP connection
3. Packaging well-known commands into byte payloads
4. Deserializing RESP responses we receive from Redis
5. Handling protocol changes (Redis supports RESP3, a superset of the original
   RESP protocol we're implementing here)
6. Pipelining commands
7. Connection pooling (handling disconnects, etc.)

In order to consume RESP in a client (phase 4 of the overall Redis connection
lifecycle), there's actually a lot going on behind the scenes:

1. Parsing the RESP bytes into the underlying data format
2. Gracefully handle incomplete byte chunks
3. Deserializing RESP bytes into structs
4. Serializing structs into RESP bytes

This article will focus on phase 1 of consuming RESP.

## Trivial Bulk String Parser

Due to its simplicity, parsing RESP is actually pretty trivial. The [Redis
website](https://redis.io/docs/reference/protocol-spec/#high-performance-parser-for-the-redis-protocol)
has a roughly dozen-line example in C that parses a RESP bulk string length.

> The RESP bulk string format is roughly `$[length]\r\n[bytes]\r\n`.

```c
#include <stdio.h>

int main(void) {
    unsigned char *p = "$123\r\n";
    int len = 0;

    p++;
    while(*p != '\r') {
        len = (len*10)+(*p - '0');
        p++;
    }

    /* Now p points at '\r', and the len is in bulk_len. */
    printf("%d\n", len);
    return 0;
}
```

However, let's use this opportunity to 1) avoid scary char math, and 2) RIIR.

[`nom`](https://lib.rs/crates/nom) is a popular parser combinator library
for Rust that makes parsing declarative and approachable. We can achieve
something similar with a lot less magic.

```rust
use nom::{
    character::complete::{char, crlf, i64},
    sequence::delimited,
};

fn main() {
    let data = b"$123\r\n";
    let (_, len) = delimited(char('$'), i64, crlf)(data).unwrap();
    println!("{}", len); // prints 123
}
```

Here we can clearly see that our parser (`delimited(char('$'), i64, crlf)`)
expects data formatted as an i64 preceded by a "$" literal and terminated by a
CRLF literal.

> You'll notice that we only care about the second item in the returned tuple
> from our parser. This is because the first item returns the slice of data that
> wasn't consumed by the parser; this will be critically important for phase 2,
> but isn't something we need to worry about for now.

I highly recommend browsing the [`nom`
documentation](https://docs.rs/nom/7.1.3/nom/index.html) to gain a better
understanding of the combinators and parsers that it provides. To get you
started, here's the documentation for the parsers we just used.

- [`delimited`](https://docs.rs/nom/7.1.3/nom/sequence/fn.delimited.html)
- [`char`](https://docs.rs/nom/7.1.3/nom/character/complete/fn.char.html)
- [`i64`](https://docs.rs/nom/7.1.3/nom/character/complete/fn.i64.html)
- [`crlf`](https://docs.rs/nom/7.1.3/nom/character/complete/fn.crlf.html)

## Parser Combinators

This is how parser combinators work: they break the grammar into small chunks of
reusable and composable parsers. We can easily extract our current parser into a
reusable function and build upon the pattern to support the rest of the RESP
data format.

Instead of just putting our parser in our `main` function (not super helpful),
let's extract it into a separate function and parse the rest of the bulk string
payload.

```rust
use nom::{
	bytes::complete::take,
	character::complete::{char, crlf, i64},
	combinator::map,
	sequence::{delimited, terminated},
	IResult,
};

/// Parse a RESP bulk string.
pub fn parse_bytes(data: &[u8]) -> IResult<&[u8], Option<&[u8]>> {
	let (data, len) = delimited(char('$'), i64, crlf)(data)?;
	Ok(match len {
		-1 => (data, None),
		0.. => map(terminated(take(len as usize), crlf), Some)(data)?,
		_ => {
			return Err(nom::Err::Failure(nom::error::Error::new(
				data,
				ErrorKind::Digit,
			)))
		}
	})
}
```

This is a bit more complicated because, instead of just returning the length, we
are using the length to parse and return the actual bulk string data. You'll
notice that we have a few different conditions depending on the length.

1. If the length is `-1`, then return `None` since this length represents a null value.
2. If the length is 0 or greater, take and return from the input `len` number of
   bytes terminated by a CRLF literal.
3. Otherwise, return an error indicating that we got an unrecognized digit
   (essentially, negative numbers other than -1 are invalid).

## Other RESP Data Types

The bulk string parser is by far the most complex, given the special casing for
negative lengths. The rest of the RESP data types are much simpler.

```rust
use std::str::from_utf8;

use nom::{
	character::complete::{char, crlf, i64, not_line_ending},
	combinator::map_res,
	error::ErrorKind,
	sequence::delimited,
	IResult,
};

/// Parse a RESP string.
pub fn parse_str(data: &[u8]) -> IResult<&[u8], &str> {
	map_res(delimited(char('+'), not_line_ending, crlf), from_utf8)(data)
}

/// Parse a RESP error.
pub fn parse_err(data: &[u8]) -> IResult<&[u8], &str> {
	map_res(delimited(char('-'), not_line_ending, crlf), from_utf8)(data)
}

/// Parse a RESP integer.
pub fn parse_int(data: &[u8]) -> IResult<&[u8], i64> {
	delimited(char(':'), i64, crlf)(data)
}

/// Parse the length of a RESP array. Parsing the array elements is handled handled by the other
/// parsers.
pub fn parse_array(data: &[u8]) -> IResult<&[u8], i64> {
	delimited(char('*'), i64, crlf)(data)
}
```

The main difference between these parsers and the bulk string parser is that
we're transforming the input bytes into the expected format. We're already
familiar with the
[`i64`](https://docs.rs/nom/7.1.3/nom/character/complete/fn.i64.html) parser
which directly gives us an i64 (we used this to parse the bulk string length);
for strings and errors, we use
[`std::str::from_utf8`](https://doc.rust-lang.org/std/str/fn.from_utf8.html)
with the [`map_res`](https://docs.rs/nom/7.1.3/nom/combinator/fn.map_res.html)
combinator to take the parsed bytes and transform them into a UTF-8 string. If
the transformation fails, `nom` will return a fatal parsing error (wrapped by
the `map_res` combinator).

## Arrays

Strings, errors, and integers are all incredibly simple, but what's up with
arrays? For bulk strings we were able to take the length and directly parse it
into bytes as the format describes, yet for arrays we simply return the length:
why can we not also parse each array element?

This is because RESP arrays can have any RESP type as an array element. When
parsing, we do not know what data type each array element is going to be. We
could easily solve this by just attempting to parse every RESP data type until a
parser succeeds, but there's actually a much more ergonomic (if more complex)
solution that we can explore in phases 3 and 4 of consuming RESP (hint: it
involves `serde`).

## Performance

You'll notice that, aside from the `i64`s, all of these parsers operate on
borrowed data. This means that our parsers are 0-copy: i.e. they do not move or
copy any bytes in memory. When parsing a string, for instance, `from_utf8`
doesn't copy the bytes and make a new string: instead, it just validates that
the byte slice is valid UTF-8 and returns an error if it is not. The bytes
behind the returned string are the same bytes that were provided to the parser.

`nom` accomplishes this through [Rust's slice
system](https://doc.rust-lang.org/book/ch04-03-slices.html). Rust slices are
double-wide pointers: they store the pointer to the memory and the length of the
sequence.[^1] While relying on [Rust's ownership
system](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) to
guarantee memory safety, `nom` can slice the underlying data as many times as
necessary to provide the exact section of the byte sequence that the data format
parsers expect.

[^1]: Slice documentation: https://doc.rust-lang.org/std/primitive.slice.html

Pointers are super fast to make and clone, especially in comparison to cloning
chunks of bytes; mostly this is because pointers have a fixed size and can
therefore be stack allocated instead of heap allocated (as would be required
when moving or cloning a chunk of bytes of unknown size).

This means that our parsers are extremely performant while still retaining
clarity through their declarative layout.
