const { SlashCommandBuilder, Guild } = require('discord.js')
const { PrismaClient } = require('../prisma/node_modules/@prisma/client')

const prisma = new PrismaClient();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_all')
        .setDescription('deletes all users from the database'),
        async execute(interaction){
            try{
                await prisma.resources.deleteMany({});
                await prisma.troops.deleteMany({});
                await prisma.user.deleteMany({});
                await interaction.reply({ content: 'Deleted Successfully'});
            }catch(error){
                throw new Error(error);
            }
        }
 }