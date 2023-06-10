# rendajs.org

This repository contains code responsible for rendering pages on [rendajs.org](https://rendajs.org/).

## Running

Run `deno task dev` to run the site locally.

### Configuring the port

By default a random available port is picked, you can choose which port to use via the `PORT` environment variable: `PORT=8080 deno task dev`.

### Configuring the manual directory

By default, the manual repository is assumed to be located next to the root of this directory and named `manual`, i.e. `../manual/` relative to this file. If this is not the case, you can configure the path via the `MANUAL_REPOSITORY_DIR` environment variable: `MANUAL_REPOSITORY_DIR=../other/dir/ deno task dev`. The provided path should be relative to the root of this repository.

### Debugging generated HTML

You can use the `PRETTY` environment variable to prettify the generated html: `PRETTY=true deno task dev`.
