# retext-syntax-urls [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

Classify url-like values (`example.com`, `index.html`, `www.alpha.bravo`) as
[syntax][source], not natural language, in [**retext**][retext].

## Installation

[npm][]:

```bash
npm install retext-syntax-urls
```

## Usage

Without `syntax-urls`:

```javascript
var dictionary = require('dictionary-en-gb');
var unified = require('unified');
var english = require('retext-english');
var stringify = require('retext-stringify');
var spell = require('retext-spell');
var urls = require('retext-syntax-urls');
var report = require('vfile-reporter');

unified()
  .use(english)
  .use(spell, dictionary)
  .use(stringify)
  .process('Have you read readme.md? Check it out: www.example.com/readme.md', function (err, file) {
    console.log(report(err || file));
  });
```

Yields:

```text
  1:15-1:24  warning  `readme.md` is misspelt        retext-spell  retext-spell
  1:40-1:55  warning  `www.example.com` is misspelt  retext-spell  retext-spell
  1:56-1:65  warning  `readme.md` is misspelt        retext-spell  retext-spell

⚠ 3 warnings
```

With `syntax-urls`:

```diff
   .use(english)
+  .use(urls)
   .use(spell, dictionary)
```

Yields:

```text
no issues found
```

## API

### `retext().use(urls)`

Classify URLs, paths, and filenames as [SourceNode][source]s, which represent
“external (ungrammatical) values” instead of natural language.  This hides them
from [`retext-spell`][spell], [`retext-readability`][readability],
[`retext-equality`][equality], and more.

## Related

*   [`retext-syntax-mentions`][syntax-mentions]
    — Classify [**@mentions**](https://github.com/blog/821) as syntax
*   [`retext-spell`][spell]
    — Check spelling
*   [`retext-readability`][readability]
    — Check readability
*   [`retext-equality`][equality]
    — Check possible insensitive, inconsiderate language

## Contribute

See [`contributing.md` in `retextjs/retext`][contributing] for ways to get
started.

This organisation has a [Code of Conduct][coc].  By interacting with this
repository, organisation, or community you agree to abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/retextjs/retext-syntax-urls.svg

[travis]: https://travis-ci.org/retextjs/retext-syntax-urls

[codecov-badge]: https://img.shields.io/codecov/c/github/retextjs/retext-syntax-urls.svg

[codecov]: https://codecov.io/github/retextjs/retext-syntax-urls

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: http://wooorm.com

[retext]: https://github.com/retextjs/retext

[source]: https://github.com/syntax-tree/nlcst#source

[spell]: https://github.com/retextjs/retext-spell

[readability]: https://github.com/retextjs/retext-readability

[equality]: https://github.com/retextjs/retext-equality

[syntax-mentions]: https://github.com/retextjs/retext-syntax-mentions

[contributing]: https://github.com/retextjs/retext/blob/master/contributing.md

[coc]: https://github.com/retextjs/retext/blob/master/code-of-conduct.md
