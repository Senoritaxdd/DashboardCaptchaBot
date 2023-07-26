const Discord = require('discord.js');

module.exports = {
	name: 'yardım',
	run: async (client, message, args) => {
		let embed = new Discord.MessageEmbed()
			.setTitle(`${client.user.username} | Yardım Menüsü`)
			.setDescription(`Komutlar aşağıda listelenmiştir`)
			.addField(`Doğrulama`, '`bypass` | `ayarla` | `doğrula`')
			.setThumbnail(client.user.displayAvatarURL())
			.setColor('RANDOM')
			.setFooter(client.user.username + ' | Levian#0186 tarafından yapılmıştır', client.user.displayAvatarURL());
		return message.channel.send({ embed: embed });
	}
};
