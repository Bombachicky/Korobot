const { PrismaClient } = require('../prisma/node_modules/@prisma/client');
const { CronJob } = require('cron');
const { Channel } = require('discord.js');

const prisma = new PrismaClient();

module.exports = {
    cronPattern: '0 12 * * * *', //checks every day at 12
    channelId: '1041861401402155048',
    guildId: '1041806928696852600',
    async execute(client){
        const channel = client.channels.cache.get(this.channelId);
        //await channel.send('<@&1057684926633357414> All players can collect resources for today');
        await channel.send('<@&1052202795140390963> Hello');
        await prisma.resources.updateMany({
            data: {
                collected: false,
            },
            where: {
                collected: true,
            }
        })
    }      
}