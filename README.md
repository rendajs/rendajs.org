# rendajs.org

This repository contains code responsible for rendering pages on [rendajs.org](https://rendajs.org/).

## Running

To run the site locally, you first have to check out this repository. To do so run

```
git clone https://github.com/rendajs/rendajs.org.git
cd rendajs.org
```

Then run the following to start a local server:

```
deno task dev
```

This should output something like

```
Listening on http://localhost:8080/
```

You can then visit http://localhost:8080/ in your favorite browser.

### Configuring the port

By default port 8080 is picked, but you can also choose which port to use via the `PORT` environment variable: `PORT=8000 deno task dev`.

### Configuring the manual directory

By default, the manual repository is assumed to be located next to the root of this directory and named `manual`, i.e. `../manual/` relative to this file. If this is not the case, you can configure the path via the `MANUAL_REPOSITORY_DIR` environment variable: `MANUAL_REPOSITORY_DIR=../other/dir/ deno task dev`. The provided path should be relative to the root of this repository.

### Debugging generated HTML

You can use the `PRETTY` environment variable to prettify the generated HTML like so: `PRETTY=true deno task dev`.
