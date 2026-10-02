const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = async (message) => {
    // Ignore bots
    if (message.author.bot) return;

    // Only respond to DMs
    if (message.guild) return;

    const menu = new StringSelectMenuBuilder()
        .setCustomId('support_dropdown')
        .setPlaceholder('What do you need help with?')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('General Support')
                .setDescription('Get help with War Grounds')
                .setEmoji('🎫')
                .setValue('general_support'),

            new StringSelectMenuOptionBuilder()
                .setLabel('Bug Report')
                .setDescription('Report a bug or issue')
                .setEmoji('🐛')
                .setValue('bug_report'),

            new StringSelectMenuOptionBuilder()
                .setLabel('Player Report')
                .setDescription('Report a player')
                .setEmoji('👤')
                .setValue('player_report'),

            new StringSelectMenuOptionBuilder()
                .setLabel('Staff Application')
                .setDescription('Apply to join the staff team')
                .setEmoji('📋')
                .setValue('staff_application'),

            new StringSelectMenuOptionBuilder()
                .setLabel('Gang Application')
                .setDescription('Apply to create a War Grounds gang')
                .setEmoji('🏴')
                .setValue('gang_application'),

            new StringSelectMenuOptionBuilder()
                .setLabel('Content Creator Application')
                .setDescription('Apply to become a War Grounds Content Creator')
                .setEmoji('🎥')
                .setValue('content_creator_application'),

            new StringSelectMenuOptionBuilder()
                .setLabel('Other')
                .setDescription('Something else')
                .setEmoji('❓')
                .setValue('other')
        );

    const row = new ActionRowBuilder()
        .addComponents(menu);

    const embed = new EmbedBuilder()
        .setTitle('WAR GROUNDS SUPPORT')
        .setDescription(
            "Hey! What can we help you with?\n\n" +
            "Select an option below to get started."
        );

    await message.reply({
        embeds: [embed],
        components: [row]
    });
};