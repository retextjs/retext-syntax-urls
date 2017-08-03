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

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/wooorm/retext-syntax-urls.svg

[travis]: https://travis-ci.org/wooorm/retext-syntax-urls

[codecov-badge]: https://img.shields.io/codecov/c/github/wooorm/retext-syntax-urls.svg

[codecov]: https://codecov.io/github/wooorm/retext-syntax-urls

[npm]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: http://wooorm.com

[retext]: https://github.com/wooorm/retext

[source]: https://github.com/wooorm/nlcst#source

[spell]: https://github.com/wooorm/retext-spell

[readability]: https://github.com/wooorm/retext-readability

[equality]: https://github.com/wooorm/retext-equality
