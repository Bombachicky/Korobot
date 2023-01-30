const { SlashCommandBuilder, Guild } = require('discord.js')
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
    data: new SlashCommandBuilder()
        .setName('buy_troops')
        .setDescription('buy troops using your resources')
        .addStringOption(option => option.setName('troop_type').setDescription('What type of troop does the user want to buy').setRequired(true))
        .addIntegerOption(option => option.setName('num_troops').setDescription('How many troops do you want to buy').setRequired(true)),

        async execute(interaction){
            const troop_type = interaction.options.getString('troop_type');
            const num_troops = interaction.options.getInteger('num_troops');
            if((num_troops % 10) !== 0)
            {
                await interaction.reply(
                    {
                        content: `Number of troops must be able to be modded by 100 (100, 200,.. etc)`
                    }
                )
            }

            if(troop_type === 'warrior' ||  troop_type === 'Warrior'){
                const resources = find_resource(interaction.user.id);
                const troops = find_troops(interaction.user.id);
                const num_food = (await resources).food;
                if(num_troops > num_food){
                await interaction.reply(
                    {
                        content: `Not enough food to be able to purchase that many troops`
                    }
                )
                }
                else{
                    const new_num_troops = num_troops + (await troops).warrior;
                    console.log(`${num_troops}`);
                    const new_num_food = (num_food - num_troops);
                    let user_prisma = await prisma.user.findUnique({
                        where: {
                            discordId: interaction.user.id,
                          },
                        })
                    let resource_prisma = await prisma.resources.update({
                    where: {
                        userId: (await user_prisma).id,
                    },
                    data: {
                        food: new_num_food,
                      },
                })
                    let troops_prisma = await prisma.troops.update({
                        where: {
                            userId: (await user_prisma).id,
                        },
                        data: {
                            warrior: new_num_troops,
                          },
                    })
                if(!resource_prisma){
                    throw new Error('NO RESOURCE FOUND')
                }
                }
                await interaction.reply({
                    content: `you now have ${(await troops).warrior} warriors and ${(await resource_prisma).food} food`
                })
            }
            else if (troop_type === 'bowmen' ||  troop_type === 'Bowmen'){
                const resources = find_resource(interaction.user.id);
                const troops = find_troops(interaction.user.id);
                const new_num_food = (await resources).food;
                const new_num_wood = (await resources).wood;
                let final_resource = 0;
                if(new_num_food >= new_num_wood){
                    final_resource = new_num_wood;
                }
                else{
                    final_resource = new_num_food;
                }
                if(num_troops > final_resource){
                    await interaction.reply(
                        {
                            content: `Not enough food to be able to purchase that many troops`
                        }
                    )
                }
                else{
                    let user_prisma = await prisma.user.findUnique({
                        where: {
                            discordId: interaction.user.id,
                          },
                        })
                    let resource_prisma = await prisma.resources.update({
                        where: {
                            userId: (await user_prisma).id,
                        },
                        data: {
                            food: new_num_food - (num_troops/2),
                            wood: new_num_wood - (num_troops/2),
                          },
                    })
                    let troops_prisma = await prisma.troops.update({
                        where: {
                            userId: (await user_prisma).id,
                        },
                        data: {
                            bowmen: (final_resource * 2),
                          },
                    })
                await interaction.reply({
                    content: `you now have ${(await troops).bowmen} bowmen and ${(await resource_prisma).food} food and ${(await resource_prisma).wood} wood`
                })
                }
            }
            
        }
}