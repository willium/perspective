---
id: development
title: Developer Guide
---

Thank you for your interest in contributing to Perspective!  This guide will
teach you everything you need to know to get started hacking on the Perspective
codebase.  If you're coming to this project as principally a Javascript
developer, please be aware that Perspective is quite a bit more complex than
a typical NPM package due to the mixed-language nature of the project;  we've
done quite a bit to make sure the newcomer experience is as straightforward as
possible, but some things might not work the way you're used to!

Perspective is organized as a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md),
and uses [lerna](https://lernajs.io/) to manage dependencies. The
`@finos/perspective` modules has an additional, unmanaged dependency
however; the [Emscripten](https://github.com/kripken/emscripten) compiler, which
is used to compile the core C++ engine to WebAssembly, and must be installed
independently.

## Building

To run a build, use

```bash
yarn build
```

If this is the first time you've built Perspective, you'll be asked to generate
a `.perspectiverc` via a short survey.  This can be later re-configured via

```bash
yarn setup
```

If everything is successful, you should be able to run any of the `examples/`
packages, e.g. `examples/simple` like so:

```bash
yarn start simple
```

For the WebAssembly compilation step, [Emscripten](https://github.com/kripken/emscripten)
is required, which can has a few pre-requisites.

### Building via Docker

For convenience, Perspective provides a Docker container for
this.  To use it, you only need to install [Docker](https://docs.docker.com/install/)
itself.

### Building via EMSDK

If you don't want to use Docker for the build, you'll need to install the
emscripten SDK, then activate and export the latest `emsdk` environment via
[`emsdk_env.sh`](https://github.com/juj/emsdk):

```bash
source emsdk/emsdk_env.sh
```

#### OSX specific instructions

Installing and activating the latest [emscripten SDK](https://github.com/kripken/emscripten):

```bash
./emsdk install latest
./emsdk activate latest
```

You'll also need Boost and CMake, which can be installed from Homebrew:

```bash
brew install cmake
brew install boost
```

#### Windows 10 specific instructions

You need to use bash in order to build Perspective packages. To successfully
build on Windows 10, enable [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
(WSL) and install the linux distribution of your choice.

Create symbolic link to easily access Windows directories and projects modified
via Windows. This way you can modify any of the Perspective files using your
favorite editors on Windows and build via Linux.

Follow the Linux specific instructions to install Emscripten and all
prerequisite tools.

#### Ubuntu/Debian

When installing Emscripten, make sure to follow [Linux specific instructions](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html#linux).

On Ubuntu, cmake will mistakenly resolve the system headers in `/usr/include`
rather than the emscripten supplied versions. You can resolve this by moving
boost to somewhere other than `/use/include` - into perspective's own `src` dir,
for example (as per [here](http://vclf.blogspot.com/2014/08/emscripten-linking-to-boost-libraries.html)).

```bash
apt-get install libboost-all-dev
cp -r /usr/include/boost ./packages/perspective/src/include/
```

## Testing

You can run the test suite simply with the standard NPM command, which will both
build the test suite for every package and run them.

```bash
yarn test
```

A Test name regex can be passed to `jest` via the same `-t` flag:

```bash
yarn test -t 'button test (A|B)'
``` 

The test suite is composed of two sections:  a Node.js test which asserts
behavior of the `@finos/perspective` library, and a suite of 
[Puppeteer](https://developers.google.com/web/tools/puppeteer/) tests which 
assert the behavior of the rest of the UI facing packages.  For the latter,
you'll need Docker installed, as these tests use a Puppeteer and Chrome build
installed in a Docker container.

The Puppeteer/UI tests are a form of [characterization tests](https://en.wikipedia.org/wiki/Characterization_test)
which use screenshots to compare current and previous behavior of `<perspective-viewer>`
and its plugins.  The results of the each comparison are stored in each
package's `test/results/results.json` file, and the screenshots themselves are
stroed in the package's `screenshots/` directory, though only the former should
be checked in to GIT.  When a test in these suites fails, a `file.failed.png`
and `file.diff.png` are also generated, showing the divergent screenshot and a
contrast diff respectively, so you can verify that the changed behavior
either does or does not reflect your patch.  If you're confident that the
screenshots reflect your change, you can update the new hashes manually in the
`test/results/results.json` file, or update all hashes with the `--wrte`
flag:

```bash
yarn test --write
```

For quick local iteration and debugging failing tests, the puppeteer tests can
use a local copy of Puppeteer, rather than relying on the supplied Docker image.
These will run much quicker, and can be optionally run without `--headless`
mode for debugging test failures quickly.  However, due to rendering
inconsistencies between platforms, the resulting test hashes will not match the
ones saved in `results.json`, so you will need to re-run the suite with the 
`--write` flag to generate a `results.local.json` file specific to your OS.

To toggle between Local and Docker Puppeteer, run

```bash
yarn toggle_puppeteer
```

This will install a local copy of puppeteer via `yarn` the first time it is run, 
if a local puppeteer is not found.

## Benchmarking

You can generate benchmarks specific to your machine's OS and CPU architecture
with Perspective's benchmark suite, which will generate a `report.html` file in
the `build/` directory of every package which supports benchmarks, as well as a
`results.json` file in the `bench/results/`, which can be checked in to GIT
with your changes to preserve them for future comparison.

```javascript
yarn bench
```

Use the `--limit <NUMBER>` flag to control the number of Perspective versions that the
benchmark suite will run, where `<NUMBER>` is an integer greater than 0. If `<NUMBER>` 
cannot be parsed, is 0, or is greater than the number of versions, the benchmark suite
will run all previous versions of Perspective.

The benchmarks report and `results.json` show a historgram of current
performance, as well as that of the previous `results.json`.  Running this
should probably be standard practice after making a large change which may
affect performance, but please create a baseline `results.json` entry for your
test machine on a commit before your changes first, such that the effects of your
PR can be properly compared.