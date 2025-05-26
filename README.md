# Check Copyrights in All Text Files

[![test](https://github.com/yegor256/copyrights-action/actions/workflows/test.yml/badge.svg)](https://github.com/yegor256/copyrights-action/actions/workflows/test.yml)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/yegor256/copyrights-action/blob/master/LICENSE.txt)

This is a GitHub Action that checks the presence of copyright notices
in all text files in the repository. Use it like this:

```yaml
name: copyrights
'on':
  push:
  pull_request:
jobs:
  copyrights:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: yegor256/copyrights-action@0.0.8
```

It will find the copyright punch line in the `LICENSE.txt` and then
will try to find its presence in all source code files. If at least one
of them doesn't have the punch line, the plugin will raise an error.
A more fine-grained configuration is also possible:

```yaml
- uses: yegor256/copyrights-action@0.0.8
  with:
    license: LICENSE.txt
    globs: >-
      **/*.java
      **/*.py
      Makefile
      **/*.xml
    ignore: >-
      target/**
      node_modules/**/*.js
```

However, it is advised to stay with the defaults.

## How to Contribute

If you want to contribute, make a fork, then create a branch,
then run `npm test` in the root directory.
It should compile everything without errors. If not, submit an issue and wait.
Otherwise, make your changes and then run `npm test` again. If the build is
still clean, submit a pull request.
