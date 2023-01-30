const { SlashCommandBuilder, EmbedBuilder, Embed, time} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.')
		.addUserOption(option => option.setName('user1').setDescription('Get the userinfo of the person here').setRequired(true)),
	 async execute(interaction, client) {

		const user1 = interaction.options.getUser('user1', true);
		const member1 = interaction.options.getMember('user1');

		const exampleEmbed = new EmbedBuilder()
			.setColor('Purple')
			.setTitle(user1.username)
			.setAuthor({ name: user1.username, iconURL: user1.displayAvatarURL()})
			.setThumbnail(user1.displayAvatarURL())
			.addFields(
				{ name: 'ID', value: user1.id },
				{ name: 'Roles', value: member1.roles.cache.map(r => r).join(" ").replace("@everyone", " ")},
				{ name: 'Server Member Since', value: time(parseInt(member1.joinedTimestamp / 1000)), inline: true},
				{ name: 'Discord Member Since', value: time(parseInt(user1.createdTimestamp  / 1000)), inline: true}
			)

			await interaction.reply({
				embeds: [exampleEmbed],
				ephemeral: true,
			})
	},
};