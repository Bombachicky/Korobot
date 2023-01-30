const { SlashCommandBuilder, Guild } = require('discord.js')
const { PrismaClient } = require('../prisma/node_modules/@prisma/client')

const prisma = new PrismaClient();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collect')
        .setDescription('collects resources'),
        async execute(interaction){
            
            try{
                const discordId = interaction.user.id;
                let user_prisma = await prisma.user.findUnique({
                where: {
                    discordId: discordId,
                  },
                })
                let resource_prisma = await prisma.resources.update({
                    where: {
                        userId: (await user_prisma).id,
                    },
                    data: {
                        food: {increment: 100},
                        wood: {increment: 100},
                        collected: true
                      },
                })
                if(!resource_prisma){
                    throw new Error('NO RESOURCE FOUND')
                }

                console.log(resource_prisma);
                
                await interaction.reply({
                content: `Resources collected, you now have ${(await resource_prisma).food} food and ${(await resource_prisma).wood} wood`,
                ephemeral: true,
                })
            }
            catch(error){
                    throw new Error(error);
                }
        }
}