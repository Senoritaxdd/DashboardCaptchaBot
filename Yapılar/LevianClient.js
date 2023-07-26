const Discord = require('discord.js'),
	{ Client, Collection } = require('discord.js'),
	{ readdirSync } = require('fs'),
	{ prefix } = require('../config').bot,
	ms = require('ms');

module.exports = class legendJsClient extends Client {
	constructor(options) {
		super(options);
		this.commands = new Collection();
		this.aliases = new Collection();
		this.prefix = prefix;
		this.config = require('../config.js');
	}

	loadCommands() {
		const client = this;
		readdirSync('./komutlar/').forEach(dir => {
			const commands = readdirSync(`./komutlar/${dir}/`).filter(file =>
				file.endsWith('.js')
			);
			for (let file of commands) {
				let pull = require(`../komutlar/${dir}/${file}`);

				if (pull.name) {
					client.commands.set(pull.name, pull);
					console.log(`[${pull.name.toUpperCase()}]: yüklendi!`);
				} else {
					console.log(`[${file.toUpperCase()}]: Hata`);
					continue;
				}

				if (pull.aliases && Array.isArray(pull.aliases))
					pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
			}
		});
		console.log('-------------------------------------');
		console.log('[BİLGİ]: Komutlar Yüklendi!');
	}

	parseMs(str) {
		const parts = str.split(' ');
		const msParts = parts.map(part => ms(part));
		if (msParts.includes(undefined)) return undefined;
		const res = msParts.reduce((a, b) => a + b);
		return res;
	}
};
