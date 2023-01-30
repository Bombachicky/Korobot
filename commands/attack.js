const { SlashCommandBuilder, Channel, Client } = require('discord.js')
const { PrismaClient } = require('../prisma/node_modules/@prisma/client');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Embed, PermissionsBitField, ButtonInteraction } = require('discord.js')

const prisma = new PrismaClient();

async function find_troops(discordId){
    try{
        let user_prisma = await prisma.user.findUnique({
            where: {
                discordId: discordId,
              },
            })
        let troop_prisma = await prisma.troops.findUnique({
            where: {
                userId: (await user_prisma).id,
            },
        })
        return troop_prisma;
    }catch(error){
        throw new Error(error)
    }
}

module.exports = {
    channelId: '1041861401402155048',
    data: new SlashCommandBuilder()
        .setName('attack')
        .setDescription('attack another player or AI nation')
        .addUserOption(option => option.setName('user').setDescription('Get the user').setRequired(true)),
        async execute(interaction, client){
            const enemy = interaction.options.getUser('user');
            const user_troops = find_troops(interaction.user.id);
            const enemy_troops = find_troops(enemy.id);
            let num_warriors = (await user_troops).warrior;
            let num_bowmen = (await user_troops).bowmen;
            let enemy_num_warriors = (await enemy_troops).warrior;
            let enemy_num_bowmen = (await enemy_troops).bowmen;
            let attack_pwr_warrior = 1;
            let attack_pwr_bowmen = 5;
            let dice = Math.floor(Math.random() * 20) + 1;
            let player_health = (1 * num_warriors) + (5 * num_bowmen);
            let enemy_health = (1 * enemy_num_warriors) + (5 * enemy_num_bowmen);
            let percentage = Math.abs((num_warriors - (enemy_num_warriors * .5) - (enemy_num_bowmen * 5)) / 
            (enemy_num_warriors * attack_pwr_warrior + enemy_num_bowmen * attack_pwr_bowmen));
            let enemy_percentage = Math.abs((enemy_num_warriors - (num_warriors * .5) - (num_bowmen * 5)) / 
            (num_warriors * attack_pwr_warrior + num_bowmen * attack_pwr_bowmen));
            let damage = (percentage * num_warriors) + dice;
            let enemy_damage = (enemy_percentage * num_warriors) + dice;
            let player_turn = true;
            const channel = interaction.client.channels.cache.get(this.channelId);
            let message_sent = false;

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('button')
                        .setLabel('Attack')
                        .setStyle(ButtonStyle.Primary),
            )

            const collector = await interaction.channel.createMessageComponentCollector({
                idle: 10000,
            });

            if(player_health <= 0){
                await interaction.reply({ content: `${interaction.user.username} loses`});
            }
            else if (enemy_health <= 0){
                await interaction.reply({ content: `${enemy.username} loses`});
            }

            collector.on('collect',  async (i) =>{
                
                if(i.customId === 'button'){
                    if(i.user.id === interaction.user.id && player_turn){
                        player_turn = false;
                        enemy_health -= damage;
                        if(enemy_health <= 0){
                            await channel.send('Enemy has died!');
                            return;
                        }
                        i.update({ content: `You have done ${damage} damage, ${enemy.username} has ${enemy_health} health`});
                    }
                    else if(i.user.id === enemy.id && !player_turn){
                        player_turn = true;
                        player_health -= enemy_damage;
                        if(player_health <= 0){
                            await channel.send('Player has died!');
                            return;
                        }
                        i.update({ content: `You have done ${enemy_damage} damage, ${interaction.user.username} now has ${player_health} health`});
                    }
                    else{

                        i.reply({ content: `You cannot participate in this battle`, ephemeral: true});
                    }
                }
            })

            collector.on('end', () => {
                 channel.send('User did not reply in time');
            })

            await interaction.reply({ components: [row] });
        }
}