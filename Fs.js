'use strict';

const { readFile, writeFile, existsSync, mkdirSync, readFileSync, renameSync, readdirSync } = require('fs');
const path = require('path');
const ncp = require('ncp').ncp;

ncp.limit = 16;

const PROJECTDIR = process.cwd();
const DIRNAME = __dirname;

class Fs {

	constructor() {

		this.templatePaths = {
			project: path.resolve(DIRNAME, 'templates/project'),
			config: path.resolve(DIRNAME, 'templates/config')
		};
		this.srcPaths = {

			project: {
				root: path.resolve(PROJECTDIR),
				configs: path.resolve(PROJECTDIR, 'configs.json'),
				style: project => path.resolve(PROJECTDIR, project, 'src/styles'),
				script: project => path.resolve(PROJECTDIR, project, 'src/scripts'),
				HTML: project => path.resolve(PROJECTDIR, project, 'src/templates/01 - HTML Templates'),
				SUB: project => path.resolve(PROJECTDIR, project, 'src/templates/01 - HTML Templates/Sub Templates'),
				SHELF: project => path.resolve(PROJECTDIR, project, 'src/templates/02 - Shelves Templates'),
				pkg: project => path.resolve(PROJECTDIR, project, 'package.json'),
				gulp: project => path.resolve(PROJECTDIR, project, 'gulpfile.js'),
				config: project => path.resolve(PROJECTDIR, project, 'configs.json'),
			},
		};
	};


	/**
	 * @returns {Array} Array list of files that can be uploaded to a VTEX
	 */
	getArchiveList() {

		const files = readdirSync(path.resolve(PROJECTDIR, 'build/arquivos'))
			.filter(file => {

				return /\.(css|js|png|jpg|gif)$/gmi.test(file);

			});

		return files;
	}

	createJsFile ( { name, overview }, type ) {

		return new Promise((resolve) => {

			readFile(this.templatePaths[type], 'utf8', (err, data) => {
				if(err) throw new Error(err);

				const createdFile = path.resolve(this.srcPaths[type], `${name}.js`);

				// if(existsSync(createdFile)) return reject(`File: ${createdFile} alredy exists`);

				const result = data
								.replace(/CONTORLLERNAME|MODULENAME/gm, name)
								.replace(/FILEOVERVIEW/gm, overview);


				writeFile(createdFile, result, 'utf8', function (err) {
					if(err) throw new Error(err);

					return resolve(createdFile);
				});
			});
		});
	}

	createConfigFile( { archives, files, html, shelf, sub, account, accountHomolog } ) {

		return new Promise((resolve, reject) => {

			const configPath = path.resolve(this.srcPaths.project.configs);

			// if(existsSync(configPath)) return reject("File still exists");

			let	cfgFile;

			writeFile(configPath, "", function(err){
				if (err) throw err;

				console.log('Updated!');
			});

			console.log(configPath); return;
			this._copyPastePromise(this.templatePaths.config, configPath)
				.then(() => {
					cfgFile = readFileSync(this.srcPaths.project.configs, 'utf8')
								.replace(/ARQUIVOS/gm, archives)
								.replace(/FILES/gm, files)
								.replace(/SHELF/gm, html)
								.replace(/HTML/gm, shelf)
								.replace(/SUB/gm, sub)
								.replace(/PROJECTACCOUNTNAME/gm, account)
								.replace(/PROJECTACCOUNTNAMEHOMOLOG/gm, accountHomolog);

					return;
				})
				.then(() => this._writeFilePromise(configs, cfgFile))
				.then(() => resolve(configPath))
		});
	}

	createProject( { name, account } ) {

		return new Promise((resolve) => {

			const projectPath = path.resolve(this.srcPaths.project.root, name);

			mkdirSync(projectPath);

			let pkgFile,
				gulpFile,
				cfgFile;

			this._copyPastePromise(this.templatePaths.project, projectPath)
				.then(() => {
					renameSync(
						path.resolve(this.srcPaths.project.style(name), 'PROJECTACCOUNTNAME_style.scss'),
						path.resolve(this.srcPaths.project.style(name), `${account}_style.scss`
					));

					renameSync(
						path.resolve(this.srcPaths.project.script(name), 'PROJECTACCOUNTNAME_script.js'),
						path.resolve(this.srcPaths.project.script(name), `${account}_app.js`
					));

					return;
				})
				.then(() => {
					pkgFile = readFileSync(this.srcPaths.project.pkg(name), 'utf8').replace(/PROJECTACCOUNTNAME/gm, account);
					gulpFile = readFileSync(this.srcPaths.project.gulp(name), 'utf8').replace(/PROJECTACCOUNTNAME/gm, account);
					cfgFile = readFileSync(this.srcPaths.project.config(name), 'utf8').replace(/PROJECTACCOUNTNAME/gm, account);

					return;
				})
				.then(() => this._writeFilePromise(this.srcPaths.project.pkg(name), pkgFile))
				.then(() => this._writeFilePromise(this.srcPaths.project.gulp(name), gulpFile))
				.then(() => this._writeFilePromise(this.srcPaths.project.config(name), cfgFile))
				.then(() => resolve(projectPath))
		});
	}

	createProjectHTML(templateList, templateType, projectFolderName) {

		return templateList.map(template => this._writeFilePromise(path.resolve(this.srcPaths.project[templateType](projectFolderName), `${template}.html`), ''));
	}

	fillProjectHTML(contents) {

		return contents.map(content => {

			return content.then(data => this._writeFilePromise(data.file, data.html))

		});
	}

	_copyPastePromise(src, dest) {

		return new Promise((resolve) => {
			ncp(src, dest, err => {
				if(err) throw new Error(err);

				resolve(true);
			});
		});
	};

	_writeFilePromise(file, content) {

		return new Promise((resolve, reject) => {
			writeFile(file, content, 'utf8', function (err) {
				if(err) throw new Error(err);

				resolve(file);
			});
		});
	};

	checkCreate( cmd, type ) {

		return new Promise((resolve, reject) => {

			const createdFile = type === 'page' ?
				path.resolve(this.srcPaths.page, cmd.name) :
				(type === 'project' ? path.resolve(this.srcPaths.project.root, cmd.name) : path.resolve(this.srcPaths[type], `${cmd.name}.js`));

			if(existsSync(createdFile)) return reject(`${createdFile} alredy exists`);

			return resolve(cmd);
		})
	}
}

module.exports = Fs;