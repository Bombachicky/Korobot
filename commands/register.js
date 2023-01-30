const { SlashCommandBuilder, Guild } = require('discord.js')
const { PrismaClient } = require('../prisma/node_modules/@prisma/client')

const prisma = new PrismaClient();

async function register(discordId, user){
    try{
         let user_prisma = await prisma.user.findUnique({
            where: {
                discordId: discordId,
              },
         })

         if(!user_prisma){
            user_prisma = await prisma.user.create({
                data: {
                    discordId: discordId,
                    name: user.username,
                    resources: {
                        create: {
                            food: 100,
                            wood: 100,
                            collected: true,
                        },
                     },
                     troops: {
                        create: {
                            warrior: 500,
                            bowmen:  100,
                        }
                     }
                  },
            })
         }
         else{
            throw new Error('User already registered to the database')
         }
         return user_prisma;
    } catch(error){
        throw new Error(error)
    }
}

async function find_resource(user_prisma){
    try{
        let resource = await prisma.resources.findUnique({
            where: {
                userId: (await user_prisma).id,
            },
        })
        if(!resource){
            throw new Error('NO RESOURCE FOUND')
        }
        return resource;
    }
    catch(error){
        throw new Error(error)
    }
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('registers a user to the prisma database')
        .addUserOption(option => option.setName('user').setDescription('Get the user').setRequired(true)),
        async execute(interaction){
            const user = interaction.options.getUser('user');
            const member = interaction.options.getMember('user');
            const role = interaction.guild.roles.cache.find(role => role.name === "Player");
            await member.roles.add(role);
            const discordId = user.id;
            try{
                const user_prisma = register(discordId, user)
                const resource = find_resource(user_prisma)
                await interaction.reply({
                    content: `${user.username} has registered, they have ${(await user_prisma).name} name and ${(await resource).food} food and ${(await resource).wood} wood`,
                    ephemeral: true,
                })
            }catch(error){
                await interaction.reply({
                    content: error.message,
                    ephemeral: true,
                })
            }
        }

}

