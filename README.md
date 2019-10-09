# xvtx

![npm](https://img.shields.io/npm/dt/xvtx.svg)

[![NPM](https://nodei.co/npm/xvtx.png)](https://nodei.co/npm/xvtx/)

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


## Commands

*Help*

```bash

$ xvtx -h

```
___

*Download all templates from vtex platform*

```bash

$ xvtx syncTemplates

$ xvtx syncTemplates --template template1.html
to download a unique template

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

$ xvtx html --template template1.html

$ xvtx html --template template1.html --create true

```
___
*Deploy SubTemplate Files*
* | When creating it, a generic class "robotCreatedThisTemplate" are added*

```bash

$ xvtx sub

$ xvtx sub --template template1.html

$ xvtx sub --template template1.html --create true

```
___
*Deploy ShelvesTemplate Files*

```bash

$ xvtx shelf

$ xvtx shelf --template template1.html

$ xvtx shelf --template template1.html --create true

```
___
*Deploy Assets Files "/arquivos" only*

```bash

$ xvtx defaultAssets

$ xvtx defaultAssets --file file1.js,file.2.css

$ xvtx defaultAssets --file file1.js

```

___
*List assets that can be uploaded to /arquivos*

```bash

$ xvtx listAssets

```

## Change log

### 1.0.24
- Added individual template download by using "--template" parameter in xvtx syncTemplates, usage: "xvtx syncTemplates --template templateName.html"
- Minor bugfixes

### 1.0.23
-  Bugfixes on xvtx syncTemplates

### 1.0.22 see more by using "xvtx [command] -h"
- Added individual file upload by using "--file" argument
- Added list file upload by using "--file file1.js,file2.css" argument
- Added individual template upload by using "--template" argument
- Added template creation parameter by using "--create true" argument




## Thanks
This project is a simplified and modified version of [Guilherme Paiva project], so great thanks to Guilherme Paiva, really.


## Next steps
*A method to download a unique template by id or name*

*Template for es6 scripts components*

*Template for new "mundinho" scripts*

*Template for new "mundinho" styles*

*CLI task to download assets files*

*CLI task to delete assets files*

*CLI task to delete template files*

*Config file to set template folders*

*Create a changelog and deprecation log*


[Guilherme Paiva project]: https://github.com/gfpaiva/jussitb

