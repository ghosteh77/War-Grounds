const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

function showApplicationModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('staff_application')
        .setTitle('War Grounds Staff Application');

    const robloxUsername = new TextInputBuilder()
        .setCustomId('roblox_username')
        .setLabel('Roblox Username')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(50);

    const experience = new TextInputBuilder()
        .setCustomId('experience')
        .setLabel('Previous Staff Experience')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(500);

    const whyStaff = new TextInputBuilder()
        .setCustomId('why_staff')
        .setLabel('Why do you want to become staff?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(500);

    const whyYou = new TextInputBuilder()
        .setCustomId('why_you')
        .setLabel('Why should we choose you?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(500);

    const activity = new TextInputBuilder()
        .setCustomId('activity')
        .setLabel('How active can you be?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(300);

    modal.addComponents(
        new ActionRowBuilder().addComponents(robloxUsername),
        new ActionRowBuilder().addComponents(experience),
        new ActionRowBuilder().addComponents(whyStaff),
        new ActionRowBuilder().addComponents(whyYou),
        new ActionRowBuilder().addComponents(activity)
    );

    return interaction.showModal(modal);
}


// ==============================
// GENERAL SUPPORT
// ==============================

function showGeneralSupportModal(interaction) {

    const modal = new ModalBuilder()
        .setCustomId('general_support')
        .setTitle('General Support');

    const message = new TextInputBuilder()
        .setCustomId('support_message')
        .setLabel('How can we help you?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000);

    modal.addComponents(
        new ActionRowBuilder().addComponents(message)
    );

    return interaction.showModal(modal);
}


// ==============================
// BUG REPORT
// ==============================

function showBugReportModal(interaction) {

    const modal = new ModalBuilder()
        .setCustomId('bug_report')
        .setTitle('Bug Report');

    const bug = new TextInputBuilder()
        .setCustomId('bug_description')
        .setLabel('Describe the bug')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000);

    modal.addComponents(
        new ActionRowBuilder().addComponents(bug)
    );

    return interaction.showModal(modal);
}


// ==============================
// PLAYER REPORT
// ==============================

function showPlayerReportModal(interaction) {

    const modal = new ModalBuilder()
        .setCustomId('player_report')
        .setTitle('Player Report');

    const player = new TextInputBuilder()
        .setCustomId('reported_player')
        .setLabel('Reported Roblox Username')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(50);

    const reason = new TextInputBuilder()
        .setCustomId('report_reason')
        .setLabel('Why are you reporting them?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000);

    modal.addComponents(
        new ActionRowBuilder().addComponents(player),
        new ActionRowBuilder().addComponents(reason)
    );

    return interaction.showModal(modal);
}


// ==============================
// OTHER
// ==============================

function showOtherModal(interaction) {

    const modal = new ModalBuilder()
        .setCustomId('other_support')
        .setTitle('Other');

    const message = new TextInputBuilder()
        .setCustomId('other_message')
        .setLabel('Tell us what you need help with')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000);

    modal.addComponents(
        new ActionRowBuilder().addComponents(message)
    );

    return interaction.showModal(modal);
}

function showContentCreatorApplicationModal(interaction) {

    const modal = new ModalBuilder()
        .setCustomId('content_creator_application')
        .setTitle('Content Creator Application');

    const platform = new TextInputBuilder()
        .setCustomId('platform')
        .setLabel('What platform do you create content on?')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100);

    const username = new TextInputBuilder()
        .setCustomId('content_username')
        .setLabel('Your channel / username')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100);

    const followers = new TextInputBuilder()
        .setCustomId('followers')
        .setLabel('How many followers/subscribers do you have?')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(50);

    const content = new TextInputBuilder()
        .setCustomId('content')
        .setLabel('What content do you create?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(500);

    const whyCreator = new TextInputBuilder()
        .setCustomId('why_creator')
        .setLabel('Why should War Grounds choose you?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(500);

    modal.addComponents(
        new ActionRowBuilder().addComponents(platform),
        new ActionRowBuilder().addComponents(username),
        new ActionRowBuilder().addComponents(followers),
        new ActionRowBuilder().addComponents(content),
        new ActionRowBuilder().addComponents(whyCreator)
    );

    return interaction.showModal(modal);
}
module.exports = {
    showApplicationModal,
    showGeneralSupportModal,
    showBugReportModal,
    showPlayerReportModal,
    showOtherModal,
    showContentCreatorApplicationModal
};