const { SlashCommandBuilder } = require('discord.js')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder, Embed, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Gives you a role if you click on the button')
        .addRoleOption(option => option.setName(`role1`).setDescription('This is the first role you want to set up').setRequired(true))
        .addRoleOption(option => option.setName(`role2`).setDescription('This is the fsecond role you want to set up').setRequired(true))
        .addRoleOption(option => option.setName(`role3`).setDescription('This is the thirdt role you want to set up').setRequired(true)),
        async execute(interaction) {

            const role1 = interaction.options.getRole(`role1`);
            const role2 = interaction.options.getRole(`role2`);
            const role3 = interaction.options.getRole(`role3`);

            const row = new ActionRowBuilder()
                .addComponents(
                     new ButtonBuilder()
                        .setCustomId('button1')
                        .setLabel(role1.name)
                        .setStyle(ButtonStyle.Primary),

                     new ButtonBuilder()
                        .setCustomId('button2')
                        .setLabel(role2.name)
                        .setStyle(ButtonStyle.Primary),

                    new ButtonBuilder()
                        .setCustomId('button3')
                        .setLabel(role3.name)
                        .setStyle(ButtonStyle.Primary),
                );

                const embed = new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('Reaction Roles')
                    .setDescription(`Click on the buttons below to receive a role`)

                await interaction.reply({embeds: [embed], components: [row] });

                const collector = await interaction.channel.createMessageComponentCollector();

                collector.on('collect', async (i) =>{
                    
                    //console.log('Hello');

                    if(i.customId === 'button1'){
                        i.member.roles.add(role1);
                        i.reply({ content: `You now have the role: ${role1.name}`});
                    }
                    else if(i.customId === 'button2'){
                        i.member.roles.add(role2);
                        i.reply({ content: `You now have the role: ${role2.name}`});
                    }
                    else if(i.customId === 'button3'){
                        i.member.roles.add(role3);
                        i.reply({ content: `You now have the role: ${role3.name}`});
                    }
                })

        },
}