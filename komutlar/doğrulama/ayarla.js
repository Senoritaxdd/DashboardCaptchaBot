const Discord = require('discord.js');

module.exports = {
	name: 'ayarla',
	run: async (client, message, args, db) => {
		if (!message.channel.permissionsFor(message.author).has('MANAGE_GUILD'))
			return message.channel.send(
				':x: | **You dont have permissions to use this Command!**'
			);
		let options = ['uyarıkanal', 'log', 'ceza', 'rol', 'sunucu', 'geçiş'];
		function check(opt, array) {
			return array.some(x => x.toLowerCase() === opt.toLowerCase());
		}
		if (!args[0]) {
			return message.channel.send(
				`:x: | **Bir seçenek belirtin, Seçenekler - ${options.join(', ')}**`
			);
		}
		if (!check(args[0], options)) {
			return message.channel.send(
				`:x: | **The only options are ${options.join(', ')}**`
			);
		}
		let channel = message.mentions.channels.first();
		switch (args[0]) {
			case 'uyarıkanal':
				if (!channel) {
					return message.channel.send(':x: | **Kanalı belirtin**');
				}
				db.set(`warningchannel_${message.guild.id}`, channel.id);
				return message.channel.send('**Uyarı Kanalı ayarlandı**');
				break;
			case 'log':
				if (!channel) {
					return message.channel.send(':x: | **Kanalı belirtin**');
				}
				db.set(`logs_${message.guild.id}`, channel.id);
				return message.channel.send('**Log kanalı ayarlandı**');
				break;
			case 'rol':
				let role =
					message.mentions.roles.first() ||
					message.guild.roles.cache.get(args[1]);
				if (!role) {
					return message.channel.send(':x: | **Rol belirtin**');
				}
				db.set(`role_${message.guild.id}`, role.id);
				return message.channel.send('**Doğrulama rolü ayarlandı**');
				break;
			case 'sunucu':
				let warningChan =
					message.guild.channels.cache.get(
						db.get(`warningchannel_${message.guild.id}`)
					) || 'Ayarlanmamış';
				let logsChan =
					message.guild.channels.cache.get(
						db.get(`logs_${message.guild.id}`)
					) || 'Ayarlanmamış';
				let verificationRole =
					message.guild.roles.cache.get(db.get(`role_${message.guild.id}`)) ||
					'Ayarlanmamış';
				let punish = db.get(`punishment_${message.guild.id}`) || 'Ayarlanmamış';
				let embed = new Discord.MessageEmbed()
					.setTitle('Ayarlar')
					.setDescription(
						'Bu sunucunun ayarları aşağıda gösterilmiştir'
					)
					.addField('Ceza', punish)
					.addField('Uyarı Kanal', warningChan)
					.addField('Log Kanal', logsChan)
					.addField('Doğrulama Rolü', verificationRole)
					.setColor('RANDOM')
					.setFooter(
						message.guild.name + ' | Levian#0186 Tarafından Yapılmıştır',
						message.guild.iconURL({ dynamic: true })
					);
				return message.channel.send({ embed: embed });
				break;
			case 'ceza':
				const punishment = args[1].toLowerCase().trim();
				const punishments = ['kick', 'ban'];
				if (!punishment)
					return message.channel.send('Lütfen bir ceza belirtin');
				if (!punishments.includes(punishment))
					return message.channel.send(
						`**ceza** argümanı şunlardan biri olmalıdır:\n${punishment
.map(x => `**${x}**`)
.join(', ')}`
					);
				db.set(`punishment_${message.guild.id}`, punishment);
				return message.channel.send(
					`**${message.guild.name} için ceza** şuna ayarlandı: **${punishment}**`
				);
				break;
		}
	}
};
