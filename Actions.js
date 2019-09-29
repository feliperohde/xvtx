'use strict';

const { prompt } = require('inquirer');
const { readFileSync, readdirSync } = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');
const Spinner = require('cli-spinner').Spinner;
const exec = require('child_process').exec;

const message = require('./utils/cli-colors');
const VtexId = require('./Vtexid');
const VtexCMS = require('./Vtexcms');
const Fs = require('./Fs');

const PROJECTDIR = process.cwd();
const VTEXID = new VtexId();
const FS = new Fs();
let VTEXCMS = null;

let fileOverview = [ { type: 'input', name: 'overview', message: 'Description of the file' } ];

class Actions {
	constructor() {
		this.account = null;
		this.email = null;
		this.localPaths = {
			lockPath: path.resolve(PROJECTDIR, 'xvtx.lock.json'),
		};

		// \/ Just to maintain the scope
		this.authAction = this.authAction.bind(this);
		this.uploadAssetsAction = this.uploadAssetsAction.bind(this);
		this.uploadDefaultAssetsAction = this.uploadDefaultAssetsAction.bind(this);
		this.uploadHTMLAction = this.uploadHTMLAction.bind(this);
		this.uploadSubHTMLAction = this.uploadSubHTMLAction.bind(this);
		this.uploadShelfAction = this.uploadShelfAction.bind(this);
		this.createProject = this.createProject.bind(this);
		this.syncTemplates = this.syncTemplates.bind(this);
		this.getTemplate = this.getTemplate.bind(this);
		this.getArchiveList = this.getArchiveList.bind(this);
	};

	_checkPath() {

		const isRoot = readFileSync(path.resolve(PROJECTDIR, 'package.json'));

		try {
			readdirSync(path.resolve(PROJECTDIR, 'build'));
		} catch(err) {
			message('error', 'Plese run in root of the project after build all files');

			throw new Error(err);
		}

		if(!isRoot) {
			message('error', 'Plese run in root of the project after build all files');

			throw new Error(err);
		}
	}

	_createFileQuestions(type) {
		return [
			{ type: 'input', name: 'name', message: `Enter the name of the ${type}` }
		];
	}

	_createSyncQuestions() {
		return [
			{ type: 'confirm', name: 'sync', message: 'Want to sync the platform templates?' }
		];
	}

	_createGetTemplateQuestions() {
		return [
			{ type: 'input', name: 'templateName', message: 'What template you want?' }
		];
	}

	getTemplate( { account = null, email = null, template = null } ) {

		const questions = this._createGetTemplateQuestions();
		let totalCmd = {};

		return prompt(questions)

				.then((res) => totalCmd = res)
				.then(() => {
					let newQuestions = [];

					if(!account) {
						newQuestions.push({ type: 'input', name: 'account', message: 'Enter the VTEX account' });
					} else {
						totalCmd.account = account;
					}

					return prompt(newQuestions)
				})
				.then(res => {
					totalCmd = {
						...totalCmd,
						...res
					}

					return totalCmd;
				})
				.then(() => {
					return this.createHTMLLocalFile(totalCmd, true);
					return true;
				})
				.catch(err => message('error', `Error on syncing template: ${err}`));
	}

	syncTemplates( { account = null, email = null, template = null, html = null , sub = null, shelf = null } ) {

		const questions = this._createSyncQuestions();
		let totalCmd = {};

		return prompt(questions)

				.then((res) => totalCmd = res)
				.then(() => {
					let newQuestions = [];

					if(!account) {
						newQuestions.push({ type: 'input', name: 'account', message: 'Enter the VTEX account' });
					} else {
						totalCmd.account = account;
					}

					if(!email) {
						newQuestions.push({ type: 'input', name: 'email', message: 'Enter the VTEX email' });
					} else {
						totalCmd.email = email;
					}

					if(!template) {
						newQuestions.push({ type: 'input', name: 'template', message: 'Enter the template name you want to sync or just enter' });
					} else {
						totalCmd.template = template;
					}

					if(!html) {
						newQuestions.push({ type: 'confirm', name: 'html', message: 'Want to sync html root templates?' });
					} else {
						totalCmd.html = html;
					}

					if(!sub) {
						newQuestions.push({ type: 'confirm', name: 'sub', message: 'Want to sync html sub templates?' });
					} else {
						totalCmd.sub = sub;
					}

					if(!shelf) {
						newQuestions.push({ type: 'confirm', name: 'shelf', message: 'Want to sync html shelf templates?' });
					} else {
						totalCmd.shelf = shelf;
					}

					return prompt(newQuestions)
				})
				.then(res => {
					totalCmd = {
						...totalCmd,
						...res
					}

					return totalCmd;
				})
				.then(() => {
					if(totalCmd.sync) return this.createHTMLLocalFiles(totalCmd, true);
					return true;
				})
				.catch(err => message('error', `Error on syncing templates: ${err}`));
	}

	createProject( { account = null } ) {

		const questions = this._createFileQuestions('project');
		let totalCmd = {};

		return prompt(questions)
				.then((res) => FS.checkCreate(res, 'project'))
				.then((res) => totalCmd = res)
				.then(() => {
					let newQuestions = [];

					if(!account) {
						newQuestions.push({ type: 'input', name: 'account', message: 'Enter the VTEX account' });
					} else {
						totalCmd.account = account;
					}

					newQuestions.push({ type: 'confirm', name: 'sync', message: 'Want to sync the platform templates?' })

					return prompt(newQuestions)
				})
				.then(res => {
					totalCmd = {
						...totalCmd,
						...res
					}

					return totalCmd;
				})
				.then(cmd => FS.createProject(cmd))
				.then(project => message('success', `${project} has been created`))
				.then(() => {
					if(totalCmd.sync) return this.createHTMLLocalFiles(totalCmd);
					return true;
				})
				.then(() => {
					this._actionTitle('Installing Dependencies');
					const child = exec(`cd ${totalCmd.name} && npm install`).stderr.pipe(process.stderr);

					return true;
				})
				.catch(err => message('error', `Error on create project: ${err}`));
	}

	createHTMLLocalFile(cmd, isSync = false) {

		this._actionTitle('SYNC: creating files');

		return this.authAction(cmd, false, false)
			.then(authCookie => {

				const spinner = new Spinner('Processing..');
				spinner.setSpinnerString('|/-\\');
				spinner.start();

						// this._actionTitle('Searching in main templates...')
				return
						VTEXCMS.getHTMLTemplates()
						.then(templateList => VTEXCMS.getTemplateNames(templateList))
						.then(templateNames => VTEXCMS.matchTemplateName(cmd.templateName,templateNames))
						.then(templateName => Promise.all(FS.createProjectHTML(templateName, 'HTML', isSync ? '' : cmd.name)))
						.then(files => VTEXCMS.setTemplateContentInChunks(files, VTEXCMS.templates))
						.then(filesHTML => Promise.all(FS.fillProjectHTML(filesHTML)))

						.then(() => {
							this._actionTitle('Searching in sub templates...');

							return VTEXCMS.getHTMLTemplates(true)
						})
						.then(templateList => VTEXCMS.getTemplateNames(templateList))
						.then(templateNames => VTEXCMS.matchTemplateName(cmd.templateName,templateNames))
						.then(templateName => Promise.all(FS.createProjectHTML(templateName, 'SUB' , isSync ? '' : cmd.name)))
						.then(files => VTEXCMS.setTemplateContentInChunks(files, VTEXCMS.templates))
						.then(filesHTML => Promise.all(FS.fillProjectHTML(filesHTML)))

						.then(() => {
							this._actionTitle('Searching in shelfs...');

							return VTEXCMS.getHTMLTemplates(false, true);
						})
						.then(templateList => VTEXCMS.getTemplateNames(templateList))
						.then(templateNames => VTEXCMS.matchTemplateName(cmd.templateName,templateNames))
						.then(templateName => Promise.all(FS.createProjectHTML(templateName, 'SHELF' , isSync ? '' : cmd.name)))
						.then(files => VTEXCMS.setTemplateContentInChunks(files, VTEXCMS.templates, true))
						.then(filesHTML => Promise.all(FS.fillProjectHTML(filesHTML)))

						.then(() => {
							spinner.stop(true);
							message('success', 'HTML Templates has been created');
						});
			});
	}

	createHTMLLocalFiles(cmd, isSync = false) {

		this._actionTitle('SYNC: creating files');

		return this.authAction(cmd, false, false)
			.then(authCookie => {

				const spinner = new Spinner('Processing..');
				spinner.setSpinnerString('|/-\\');
				spinner.start();

				return VTEXCMS.getHTMLTemplates()
						.then(templateList => VTEXCMS.getTemplateNames(templateList))
						.then(templateList => {console.log(templateList); return templateList;})
						.then(templateNames => VTEXCMS.matchTemplateName(cmd.template,templateNames))
						.then(templateNames => Promise.all(FS.createProjectHTML(templateNames, 'HTML', isSync ? '' : cmd.name)))
						.then(files => VTEXCMS.setTemplateContentInChunks(files, VTEXCMS.templates))
						.then(filesHTML => Promise.all(FS.fillProjectHTML(filesHTML)))

						.then(() => VTEXCMS.getHTMLTemplates(true))
						.then(templateList => VTEXCMS.getTemplateNames(templateList))
						.then(templateList => {console.log(templateList); return templateList;})
						.then(templateNames => VTEXCMS.matchTemplateName(cmd.template,templateNames))
						.then(templateNames => Promise.all(FS.createProjectHTML(templateNames, 'SUB' , isSync ? '' : cmd.name)))
						.then(files => VTEXCMS.setTemplateContentInChunks(files, VTEXCMS.templates))
						.then(filesHTML => Promise.all(FS.fillProjectHTML(filesHTML)))

						.then(() => VTEXCMS.getHTMLTemplates(false, true))
						.then(templateList => VTEXCMS.getTemplateNames(templateList))
						.then(templateList => {console.log(templateList); return templateList;})
						.then(templateNames => VTEXCMS.matchTemplateName(cmd.template,templateNames))
						.then(templateNames => Promise.all(FS.createProjectHTML(templateNames, 'SHELF' , isSync ? '' : cmd.name)))
						.then(files => VTEXCMS.setTemplateContentInChunks(files, VTEXCMS.templates, true))
						.then(filesHTML => Promise.all(FS.fillProjectHTML(filesHTML)))

						.then(() => {
							spinner.stop(true);
							message('success', 'HTML Templates has been created');
						});
			});
	}

	authAction( { email = null, account = null, site = 'default' }, checkPath = true, writeAuthStore = true ) {

		if(checkPath) this._checkPath();

		if(VTEXID.authCookie) return Promise.resolve(VTEXID.authCookie);

		const questions = [];

		if(!account) {
			questions.push({ type: 'input', name: 'account', message: 'Enter the VTEX account' });
		} else {
			this.account = account;
		}

		if(!email) {
			questions.push({ type: 'input', name: 'email', message: 'Enter your e-mail' })
		} else {
			this.email = email;
		}

		return prompt(questions)
				.then(( { account, email } ) => {
					if(!this.account) this.account = account;
					if(!this.email) this.email = email;

					VTEXID.setAccount(this.account);

					const authStore = VTEXID.checkAuthStore(this.account, this.email, writeAuthStore);

					if(authStore) {
						VTEXID.setAuthCookie(authStore);
						return authStore;
					}

					return VTEXID.getEmailAccessKey(this.email)
							.then(() => prompt({ type: 'input', name: 'accesskey', message: 'Enter the VTEX Access Key (with 6 digits)' }))
							.then(( { accesskey } ) => VTEXID.authenticateByEmailKey(this.email, accesskey))
							.then(authCookie => {
								if(writeAuthStore) VTEXID.writeAuthStore(this.account, this.email, authCookie);
								return authCookie;
							});
				})
				.then(authCookie => {
					VTEXCMS = new VtexCMS(this.account, authCookie, site);
					return authCookie;
				});
	};

	uploadAssetsAction(cmd) {

		return this.authAction(cmd)
			.then(authCookie => {

				this._actionTitle(`Uploading Files (/files)`);

				return Promise.all(VTEXCMS.setAssetFile(cmd))
				.then(responses => {
					// responses.map(file => message('success', `Uploaded File ${file}`));
					this._successUpload(responses, 'Asset');
					return cmd;
				});
			});
	};

	uploadDefaultAssetsAction(cmd) {

		return this.authAction(cmd)
			.then(authCookie => {

				this._actionTitle(`Uploading Files (/arquivos)`);

				return VTEXCMS.getRequestToken()
					.then(requestToken => Promise.all(VTEXCMS.defaultAssets(requestToken, cmd)))
					.then(responses => {
						// responses.map(file => message('success', `Uploaded File ${file}`));
						this._successUpload(responses, 'Asset');
						return cmd;
					});
			});
	};

	getArchiveList() {

		let list = FS.getArchiveList();

		list.map(file => message("success", `${file}`));

		return this;
	};

	uploadHTMLAction(cmd) {

		return this.authAction(cmd)
			.then(authCookie => {

				this._actionTitle(`Uploading Templates HTML`);

				return VTEXCMS.getHTMLTemplates()
						.then(templateList => Promise.all(VTEXCMS.setHTML(templateList, false, false, cmd)))
						.then(responses => {
							this._successUpload(responses);
							return cmd;
						});
			});
	};

	uploadSubHTMLAction(cmd) {

		return this.authAction(cmd)
			.then(authCookie => {

				this._actionTitle(`Uploading SubTemplates HTML`);

				return VTEXCMS.getHTMLTemplates(true)
						.then(templateList => Promise.all(VTEXCMS.setHTML(templateList, true, false, cmd)))
						.then(responses => {
							this._successUpload(responses);
							return cmd;
						});
			});
	};

	uploadShelfAction(cmd) {

		return this.authAction(cmd)
			.then(authCookie => {

				this._actionTitle(`Uploading Shelves HTML`);

				return VTEXCMS.getHTMLTemplates(true, true)
						.then(templateList => Promise.all(VTEXCMS.setHTML(templateList, false, true, cmd)))
						.then(responses => {
							this._successUpload(responses);
							return cmd;
						});
			});
	};

	_successUpload(responses, typeFile = 'Template') {

		responses.map(( { type, templateName, content, account } ) => {
			message(type, `${type === 'success' ? 'Uploaded' : 'Hold' } ${typeFile} ${templateName}`);

			if(!content) return;

			const lock = jsonfile.readFileSync(this.localPaths.lockPath, { throws: false });
			const newLock = {
				...lock,
				[account]: {
					...lock[account],
					[templateName]: {
						content,
						lastUpdate: new Date()
					}
				}
			};

			jsonfile.writeFileSync(this.localPaths.lockPath, newLock, {spaces: 4});
		});
	};

	_actionTitle(messageText) {

		console.log('\n*****************************');
		message('notice', messageText);
		console.log('*****************************\n');
	}
};

module.exports = Actions;