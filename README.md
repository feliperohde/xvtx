# xvtx
A simple vtex cli for basic things.
Hurry up don't waste your time, do these commands in your terminal:


## Installation

```bash

$ npm install -g xvtx

```

## xvtx global usage

```bash

$ xvtx deploy

```

Provide your email and account name to login, after wait the upload processes.

## xvtx.lock.json

The process will generate a xvtx.lock.json file in root path of your project.

This file is used to cache files and prevent upload files with same content, we recomend to not delete or ignore this file.

## xvtx.auth.json

The process will generate a xvtx.auth.json file in root path of your project.

This file is used to cache your auth login cookie, we recomend to ignore this file in .gitignore.


## Extra

Other utils commands:

*Help*

```bash

$ xvtx -h

```
___

*Deploy auto provide account and email*

```bash

$ xvtx deploy --account <accountName> --email <email>

```
___
*Force update all files ignoring lockfile*

```bash

$ xvtx deploy --force

```
___
*Deploy Template Files*

```bash

$ xvtx html

```
___
*Deploy SubTemplate Files*

```bash

$ xvtx sub

```
___
*Deploy ShelvesTemplate Files*

```bash

$ xvtx shelf

```
___
*Deploy Assets Files*

```bash

$ xvtx assets

```

## Thanks
This project is a simplified copy of [Guilherme Paiva project], so great thanks to Guilherme Paiva, really.


## Next steps
*Template for es6 scripts components*

*Template for new "mundinho" scripts*

*Template for new "mundinho" styles*

*CLI task to download assets files*

*CLI task to delete assets files*

*CLI task to delete template files*


[Guilherme Paiva project]: https://github.com/gfpaiva/jussitb

