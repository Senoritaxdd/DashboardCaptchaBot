
const Client = require('./Yapılar/LevianClient.js'),
	Discord = require('discord.js'),
	{ prefix: defaultPrefix, token } = require('./config').bot,
	client = new Client({ disableMentions: 'everyone' }),
	db = require('quick.db'),
	dashboard = require('./dashboard/index'),
	moment = require('moment'),
	config = require('./config');

client.loadCommands();

console.log('-------------------------------------');
console.log(`
  _     _______     _____    _    _   _         ____ ___  ____  _____ 
 | |   | ____\ \   / /_ _|  / \  | \ | |       / ___/ _ \|  _ \| ____|
 | |   |  _|  \ \ / / | |  / _ \ |  \| |      | |  | | | | | | |  _|  
 | |___| |___  \ V /  | | / ___ \| |\  |      | |__| |_| | |_| | |___ 
 |_____|_____|  \_/  |___/_/   \_\_| \_|       \____\___/|____/|_____|
`);

console.log('-------------------------------------');
console.log(
	'Levian#0186 Tarafından Yapılmıştır'
);
console.log('-------------------------------------');
client.on('ready', () => {

	
	console.log('-------------------------------------');
	client.user.setActivity('Levian Youtube Kanalını', {
		type: 'WATCHING'
	});
});

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.guild) return;
	let prefix = db.get(`prefix_${message.guild.id}`) || defaultPrefix;
	if (!message.content.startsWith(prefix)) return;
	if (!message.member)
		message.member = await message.guild.members.fetch(message);

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const cmd = args.shift().toLowerCase();

	if (cmd.length === 0) return;

	let command = client.commands.get(cmd);
	if (!command) command = client.commands.get(client.aliases.get(cmd));
	if (command) command.run(client, message, args, db);
});

client.on('guildMemberAdd', async member => {
	let { guild, user } = member;
	let prefix = db.get(`prefix_${member.guild.id}`) || defaultPrefix;
	let bypassed = db.get(`bypass_${guild.id}`) || [];
	if (bypassed.includes(user.id)) return;
	let warningChan = member.guild.channels.cache.get(
		db.get(`warningchannel_${member.guild.id}`)
	);
	let logsChan = member.guild.channels.cache.get(
		db.get(`logs_${member.guild.id}`)
	);

	let embed = new Discord.MessageEmbed()
		.setTitle(`Doğrulama Log`)
		.setDescription(`Üye katıldı`)
		.setFooter(member.guild.name, member.guild.iconURL())
		.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
		.addField(`Üye`, `<@${member.user.id}> (${member.user.id})`)
		.addField(
			`Hesap Yaşı`,
			`${moment(member.user.createdAt).fromNow()} oluşturuldu`
		)
		.setColor(
			`${
				Date.now() - member.user.createdAt < 60000 * 60 * 24 * 7
					? '#FF0000'
					: '#00FF00'
			}`
		); 
	logsChan.send({ embed: embed }).catch(err => {});
	member.user
		.send(
			`Merhaba ${member.user.username},
${member.guild.name} sunucuna hoş geldiniz. Bu sunucu ${client.user.username} tarafından korunmaktadır.
\n
Hesabınızı doğrulamak için lütfen https://${config.website.domain}/verify/${member.guild.id}\nDoğrulamayı tamamlamak için 15 dakikanız var!
Saygılarımızla, ${member.guild.name} yekili ekibi ekibi.`
		)
		.catch(err => {
			warningChan.send(
				`<@${
					member.user.id
				}> Merhaba, DM'iniz kapalı gözüküyor, lütfen DM'inizi açın ve  \`${prefix}doğrula\` komutunu kullanın.`
			);
		});
	warningChan
		.send(
			`<@${
				member.user.id
			}> Merhaba, Bu sunucuya katılmak için hesabınızı doğrulamanız gerekir. Lütfen size gönderdiğim DM'yi dikkatlice okuyunuz. Doğrulamayı tamamlamak için 15 dakikanız var!`
		)
		.catch(err => {});

	setTimeout(function() {
		if (!member) return;
		if (db.get(`verified_${guild.id}_${user.id}`) || false) {
			return;
		} else {
			let kicked = true;
			member.user
				.send('Cevap vermediğiniz için sunucudan atıldınız!')
				.catch(err => {});
			member.kick().catch(err => {
				kicked = false;
			});
			let embed = new Discord.MessageEmbed()
				.setTitle(`Doğrulama Log`)
				.setDescription(`Üye Atıldı`)
				.setFooter(member.guild.name, member.guild.iconURL())
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.addField(`Üye`, `<@${member.user.id}> (${member.user.id})`)
				.addField('Sebep', 'üye cevap vermedi')
				.setColor('#00FF00');

			let embed2 = new Discord.MessageEmbed()
				.setTitle(`Doğrulama Log`)
				.setDescription(`Üye atılamadı`)
				.setFooter(member.guild.name, member.guild.iconURL())
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.addField(`Üye`, `<@${member.user.id}> (${member.user.id})`)
				.addField('Atma Sebebi', 'üye cevap vermedi')
				.setColor('#FF0000');
			if (kicked) return logsChan.send({ embed: embed });
			else return logsChan.send({ embed: embed2 });
		}
	}, 60000 * 15);
});

client.on('guildMemberRemove', async member => {
  db.delete(`ip_${member.guild.id}_${member.user.id}`);
	db.delete(`verified_${member.guild.id}_${member.user.id}`);
});

client.login(token).catch(err => {
	console.log('[ERROR]: TOKEN HATALI CONFIG DOSYASINDAN AYARLAYINIZ');
});
dashboard(client);
