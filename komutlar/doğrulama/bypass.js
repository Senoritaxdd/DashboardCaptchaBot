module.exports = {
	name: 'bypass',
	run: async (client, message, args, db) => {
		if (!message.channel.permissionsFor(message.author).has('MANAGE_GUILD'))
			return message.channel.send(
				':x: | **Bu Komutu kullanma izniniz yok!**'
			);
		let options = ['ekle', 'çıkar'];
		function check(opt) {
			return options.some(x => x === opt);
		}
		async function fetchUser(ID) {
			let user = await client.users.fetch(ID);
			return user;
		}
		async function checkUser(ID) {
			let user = await fetchUser(ID);
			if (!user) return false;
			else return true;
		}
		let option = args[0];
		let ID =
			args[1] || message.mentions.users.first()
				? message.mentions.users.first().id
				: null;
		if (!option)
			return message.channel.send(
				`:x: | **Seçenek argümanı ${options.join(', ')} öğelerinden biri olmalıdır**`
			);
		if (!ID)
			return message.channel.send(
				`:x: | **ID / etiket  gerekli bir argümandır**`
			);
		if (!check(option.toLowerCase()))
			return message.channel.send(
				`:x: | **Seçenek argümanı ${options.join(', ')} öğelerinden biri olmalıdır** `
			);
		switch (option.toLowerCase()) {
			case 'add':
				if (!checkUser(ID))
					return message.channel.send(`:x: | **kullanıcı mevcut değil**`);
				else {
					let role = message.guild.roles.cache.get(
						db.get(`role_${message.guild.id}`)
					);
					if (role && message.guild.members.cache.get(ID)) {
						message.guild.members.cache
							.get(ID)
							.roles.add(role)
							.catch(err => {});
					}
					let user = await fetchUser(ID);
					let pog = db.get(`bypass_${message.guild.id}`) || [];
					db.push(`bypass_${message.guild.id}`, { id: user.id });
					let data = pog.find(x => x.id === ID);
					if (data)
						return message.channel.send(
							'**Kullanıcı zaten bypass listesinde**'
						);
					return message.channel.send(
						`${user.tag}, bypass listesine eklendi`
					);
				}
				break;
			case 'remove':
				if (!checkUser(ID))
					return message.channel.send(`:x: | **Kullanıcı mevcut değil**`);
				else {
					let role = message.guild.roles.cache.get(
						db.get(`role_${message.guild.id}`)
					);
					if (role && message.guild.members.cache.get(ID)) {
						message.guild.members.cache
							.get(ID)
							.roles.remove(role)
							.catch(err => {});
					}
					let user = await fetchUser(ID);
					let pog = db.get(`bypass_${message.guild.id}`) || [];
					if (pog) {
						let data = pog.find(x => x.id === ID);
						if (!data)
							return message.channel.send(
								'**Kullanıcı bypass listesinde değil**'
							);
						let index = pog.indexOf(data);
						delete pog[index];
						var filter = pog.filter(x => {
							return x != null && x != '';
						});
						db.set(`bypass_${message.guild.id}`, filter);
					}
					return message.channel.send(
						`${user.tag}, bypass listesinden silindi`
					);
				}
				break;
		}
	}
};
