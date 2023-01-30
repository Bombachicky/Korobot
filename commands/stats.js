const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} = require('discord.js');
const { PrismaClient } = require('../prisma/node_modules/@prisma/client')

const prisma = new PrismaClient();

async function find_resource(discordId){
    try{
        let user_prisma = await prisma.user.findUnique({
            where: {
                discordId: discordId,
              },
            })
        let resource = await prisma.resources.findUnique({
            where: {
                userId: (await user_prisma).id,
            },
        })
        return resource;
    }catch(error){
        throw new Error(error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Provides information about your stats.'),
	 async execute(interaction, client) {
        const file = new AttachmentBuilder('../Discord Bot/assets/WorldGlobe.png');
        const resource = find_resource(interaction.user.id)
		const exampleEmbed = new EmbedBuilder()
            .setColor('Purple')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
            .setThumbnail('attachment://WorldGlobe.png')
            .addFields(
				{ name: '🥞Food', value: `${(await resource).food}` },
				{ name: '🪓Wood', value: `${(await resource).wood}` },
			)

            await interaction.reply({
				embeds: [exampleEmbed], files: [file],
			})
     }
}