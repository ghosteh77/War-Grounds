const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits
} = require('discord.js');

const {
    showApplicationModal,
    showGeneralSupportModal,
    showBugReportModal,
    showPlayerReportModal,
    showOtherModal,
    showContentCreatorApplicationModal,
} = require('../handlers/applicationHandler');

const Application = require('../models/Application');
const ApplicationSettings = require('../models/ApplicationSettings');

const APPLICATION_CHANNEL_ID = '1553511209087533106';
const TICKET_CATEGORY_ID = '1553514929318002938';
const SUPPORT_TICKET_CATEGORY_ID = '1553796041055146104';

const WARNING_LOG_CHANNEL_ID = '1554154509591249077';

const WARN_1_ROLE_ID = '1554153810417688706';
const WARN_2_ROLE_ID = '1554153848648638524';
const WARN_3_ROLE_ID = '1554153885269229759';

const STAFF_ROLE_IDS = [
    '1553456745232343290',
    '1553456373205835796',
    '1553514599259574302'
];
const CONTENT_CREATOR_REVIEW_CHANNEL_ID =
    '1554385071228854383';

const CONTENT_CREATOR_TICKET_CATEGORY_ID =
    '1553514929318002938';

const CONTENT_CREATOR_STAFF_ROLE_IDS = [
    '1553456745232343290',
    '1553456373205835796',
    '1553514599259574302'
];

function getSupportGuild(client) {
    return client.guilds.cache.first();
}

module.exports = async (interaction) => {

    console.log(
        '📩 Interaction:',
        interaction.type,
        interaction.customId || interaction.commandName
    );

    /*
    ============================================================
    /applications COMMAND
    ============================================================
    */

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'say') {

            const isStaff = STAFF_ROLE_IDS.some(
                roleId =>
                    interaction.member.roles.cache.has(roleId)
            );

            if (!isStaff) {
                return interaction.reply({
                    content:
                        '❌ You do not have permission to use `/say`.',
                    ephemeral: true
                });
            }

            const message =
                interaction.options.getString('message');

            await interaction.channel.send({
                content: message
            });

            return interaction.reply({
                content: '✅ Message sent.',
                ephemeral: true
            });
        }

if (interaction.commandName === 'contentcreator') {

    return showContentCreatorApplicationModal(
        interaction
    );
}
        /*
        ========================================================
        /warn
        ========================================================
        */

        if (interaction.commandName === 'warn') {

            const isStaff = STAFF_ROLE_IDS.some(roleId =>
                interaction.member.roles.cache.has(roleId)
            );

            if (!isStaff) {
                return interaction.reply({
                    content:
                        '❌ You do not have permission to warn members.',
                    ephemeral: true
                });
            }

            const member =
                interaction.options.getMember('member');

            const reason =
                interaction.options.getString('reason');

            if (!member) {
                return interaction.reply({
                    content:
                        '❌ I could not find that member.',
                    ephemeral: true
                });
            }

            if (member.user.bot) {
                return interaction.reply({
                    content:
                        '❌ You cannot warn a bot.',
                    ephemeral: true
                });
            }

            if (member.id === interaction.user.id) {
                return interaction.reply({
                    content:
                        '❌ You cannot warn yourself.',
                    ephemeral: true
                });
            }

            if (
                member.roles.highest.position >=
                interaction.member.roles.highest.position
            ) {
                return interaction.reply({
                    content:
                        '❌ You cannot warn a member with an equal or higher role than you.',
                    ephemeral: true
                });
            }

            /*
            ----------------------------------------------------
            Determine current warning level
            ----------------------------------------------------
            */

            let warningLevel = 0;

            if (member.roles.cache.has(WARN_3_ROLE_ID)) {
                warningLevel = 3;
            } else if (member.roles.cache.has(WARN_2_ROLE_ID)) {
                warningLevel = 2;
            } else if (member.roles.cache.has(WARN_1_ROLE_ID)) {
                warningLevel = 1;
            }

            const newWarningLevel =
                warningLevel + 1;

            /*
            ----------------------------------------------------
            Remove previous warning role
            ----------------------------------------------------
            */

            try {

                if (
                    member.roles.cache.has(
                        WARN_1_ROLE_ID
                    )
                ) {
                    await member.roles.remove(
                        WARN_1_ROLE_ID
                    );
                }

                if (
                    member.roles.cache.has(
                        WARN_2_ROLE_ID
                    )
                ) {
                    await member.roles.remove(
                        WARN_2_ROLE_ID
                    );
                }

                if (
                    member.roles.cache.has(
                        WARN_3_ROLE_ID
                    )
                ) {
                    await member.roles.remove(
                        WARN_3_ROLE_ID
                    );
                }

            } catch (error) {

                console.error(
                    '❌ Failed to remove previous warning role:',
                    error
                );

                return interaction.reply({
                    content:
                        '❌ I could not update the member warning role. Please check my role permissions.',
                    ephemeral: true
                });
            }

            /*
            ----------------------------------------------------
            WARNING 1
            ----------------------------------------------------
            */

            if (newWarningLevel === 1) {

                try {

                    await member.roles.add(
                        WARN_1_ROLE_ID
                    );

                } catch (error) {

                    console.error(
                        '❌ Failed to add Warn 1 role:',
                        error
                    );

                    return interaction.reply({
                        content:
                            '❌ I could not add the Warn 1 role. Please check my role permissions.',
                        ephemeral: true
                    });
                }

                try {

                    await member.send(
                        `⚠️ **You have received a warning in War Grounds.**\n\n` +
                        `**Warning:** 1/3\n` +
                        `**Reason:** ${reason}\n\n` +
                        `Please make sure to follow the server rules. ` +
                        `Further warnings may result in additional moderation action.`
                    );

                } catch (error) {

                    console.log(
                        '⚠️ Could not DM the warned member.'
                    );
                }

                const logChannel =
                    interaction.guild.channels.cache.get(
                        WARNING_LOG_CHANNEL_ID
                    );

                if (logChannel) {

                    const logEmbed =
                        new EmbedBuilder()
                            .setTitle(
                                '⚠️ Member Warned'
                            )
                            .setColor(
                                0xfee75c
                            )
                            .addFields(
                                {
                                    name: '👤 Member',
                                    value:
                                        `${member.user} ` +
                                        `(\`${member.id}\`)`
                                },
                                {
                                    name: '🛡️ Warn Level',
                                    value: '1/3'
                                },
                                {
                                    name: '📝 Reason',
                                    value: reason
                                },
                                {
                                    name: '👮 Moderator',
                                    value:
                                        `${interaction.user} ` +
                                        `(\`${interaction.user.id}\`)`
                                }
                            )
                            .setTimestamp();

                    await logChannel.send({
                        embeds: [
                            logEmbed
                        ]
                    });
                }

                return interaction.reply({
                    content:
                        `⚠️ ${member} has received **Warning 1/3**.\n` +
                        `**Reason:** ${reason}`
                });
            }

            /*
            ----------------------------------------------------
            WARNING 2
            ----------------------------------------------------
            */

            if (newWarningLevel === 2) {

                try {

                    await member.roles.add(
                        WARN_2_ROLE_ID
                    );

                } catch (error) {

                    console.error(
                        '❌ Failed to add Warn 2 role:',
                        error
                    );

                    return interaction.reply({
                        content:
                            '❌ I could not add the Warn 2 role. Please check my role permissions.',
                        ephemeral: true
                    });
                }

                try {

                    await member.send(
                        `⚠️ **You have received a warning in War Grounds.**\n\n` +
                        `**Warning:** 2/3\n` +
                        `**Reason:** ${reason}\n\n` +
                        `You have now received your second warning. ` +
                        `Further moderation action may be taken.`
                    );

                } catch (error) {

                    console.log(
                        '⚠️ Could not DM the warned member.'
                    );
                }

                const logChannel =
                    interaction.guild.channels.cache.get(
                        WARNING_LOG_CHANNEL_ID
                    );

                if (logChannel) {

                    const logEmbed =
                        new EmbedBuilder()
                            .setTitle(
                                '⚠️ Member Warned'
                            )
                            .setColor(
                                0xfee75c
                            )
                            .addFields(
                                {
                                    name: '👤 Member',
                                    value:
                                        `${member.user} ` +
                                        `(\`${member.id}\`)`
                                },
                                {
                                    name: '🛡️ Warn Level',
                                    value: '2/3'
                                },
                                {
                                    name: '📝 Reason',
                                    value: reason
                                },
                                {
                                    name: '👮 Moderator',
                                    value:
                                        `${interaction.user} ` +
                                        `(\`${interaction.user.id}\`)`
                                }
                            )
                            .setTimestamp();

                    await logChannel.send({
                        embeds: [
                            logEmbed
                        ]
                    });
                }

                return interaction.reply({
                    content:
                        `⚠️ ${member} has received **Warning 2/3**.\n` +
                        `**Reason:** ${reason}`
                });
            }

            /*
            ----------------------------------------------------
            WARNING 3 → KICK
            ----------------------------------------------------
            */

            if (newWarningLevel >= 3) {

                try {

                    await member.roles.add(
                        WARN_3_ROLE_ID
                    );

                } catch (error) {

                    console.error(
                        '❌ Failed to add Warn 3 role:',
                        error
                    );

                    return interaction.reply({
                        content:
                            '❌ I could not add the Warn 3 role. Please check my role permissions.',
                        ephemeral: true
                    });
                }

                try {

                    await member.send(
                        `⚠️ **You have received your third warning in War Grounds.**\n\n` +
                        `**Warning:** 3/3\n` +
                        `**Reason:** ${reason}\n\n` +
                        `You have been kicked from the server because you reached 3 warnings.`
                    );

                } catch (error) {

                    console.log(
                        '⚠️ Could not DM the warned member.'
                    );
                }

                const logChannel =
                    interaction.guild.channels.cache.get(
                        WARNING_LOG_CHANNEL_ID
                    );

                if (logChannel) {

                    const logEmbed =
                        new EmbedBuilder()
                            .setTitle(
                                '🚨 Member Kicked — 3 Warnings'
                            )
                            .setColor(
                                0xed4245
                            )
                            .addFields(
                                {
                                    name: '👤 Member',
                                    value:
                                        `${member.user} ` +
                                        `(\`${member.id}\`)`
                                },
                                {
                                    name: '🛡️ Warn Level',
                                    value: '3/3'
                                },
                                {
                                    name: '📝 Reason',
                                    value: reason
                                },
                                {
                                    name: '👮 Moderator',
                                    value:
                                        `${interaction.user} ` +
                                        `(\`${interaction.user.id}\`)`
                                },
                                {
                                    name: '🔨 Action',
                                    value: 'Member kicked'
                                }
                            )
                            .setTimestamp();

                    await logChannel.send({
                        embeds: [
                            logEmbed
                        ]
                    });
                }

                try {

                    await member.kick(
                        `Reached 3 warnings: ${reason}`
                    );

                } catch (error) {

                    console.error(
                        '❌ Failed to kick member:',
                        error
                    );

                    return interaction.reply({
                        content:
                            `⚠️ ${member} received **Warning 3/3**, but I could not kick them. Please check my Kick Members permission and role hierarchy.`,
                        ephemeral: true
                    });
                }

                return interaction.reply({
                    content:
                        `🚨 ${member.user.tag} received **Warning 3/3** and has been kicked.\n` +
                        `**Reason:** ${reason}`
                });
            }

            return;
        }
                /*
        /*
        ========================================================
        /removewarn
        /*
        ========================================================
        */

        if (interaction.commandName === 'removewarn') {

            const isStaff = STAFF_ROLE_IDS.some(roleId =>
                interaction.member.roles.cache.has(roleId)
            );

            if (!isStaff) {
                return interaction.reply({
                    content:
                        '❌ You do not have permission to remove warnings.',
                    ephemeral: true
                });
            }

            const member =
                interaction.options.getMember('member');

            if (!member) {
                return interaction.reply({
                    content:
                        '❌ I could not find that member.',
                    ephemeral: true
                });
            }

            if (member.user.bot) {
                return interaction.reply({
                    content:
                        '❌ You cannot remove a warning from a bot.',
                    ephemeral: true
                });
            }

            /*
            ----------------------------------------------------
            Determine current warning level
            ----------------------------------------------------
            */

            let warningLevel = 0;

            if (member.roles.cache.has(WARN_3_ROLE_ID)) {
                warningLevel = 3;
            } else if (member.roles.cache.has(WARN_2_ROLE_ID)) {
                warningLevel = 2;
            } else if (member.roles.cache.has(WARN_1_ROLE_ID)) {
                warningLevel = 1;
            }

            if (warningLevel === 0) {
                return interaction.reply({
                    content:
                        '❌ This member does not have any warnings.',
                    ephemeral: true
                });
            }

            const newWarningLevel =
                warningLevel - 1;

            /*
            ----------------------------------------------------
            Remove current warning role
            ----------------------------------------------------
            */

            try {

                if (warningLevel === 3) {
                    await member.roles.remove(
                        WARN_3_ROLE_ID
                    );
                } else if (warningLevel === 2) {
                    await member.roles.remove(
                        WARN_2_ROLE_ID
                    );
                } else if (warningLevel === 1) {
                    await member.roles.remove(
                        WARN_1_ROLE_ID
                    );
                }

                /*
                ------------------------------------------------
                Add lower warning role if needed
                ------------------------------------------------
                */

                if (newWarningLevel === 2) {
                    await member.roles.add(
                        WARN_2_ROLE_ID
                    );
                } else if (newWarningLevel === 1) {
                    await member.roles.add(
                        WARN_1_ROLE_ID
                    );
                }

            } catch (error) {

                console.error(
                    '❌ Failed to remove warning:',
                    error
                );

                return interaction.reply({
                    content:
                        '❌ I could not update the member warning role. Please check my role permissions.',
                    ephemeral: true
                });
            }

            /*
            ----------------------------------------------------
            DM member
            ----------------------------------------------------
            */

            try {

                await member.send(
                    `✅ **A warning has been removed from you in War Grounds.**\n\n` +
                    `**Previous Warning Level:** ${warningLevel}/3\n` +
                    `**Current Warning Level:** ${newWarningLevel}/3\n\n` +
                    `A member of the staff team has removed one of your warnings.`
                );

            } catch (error) {

                console.log(
                    '⚠️ Could not DM the member about the warning removal.'
                );
            }

            /*
            ----------------------------------------------------
            Warning log
            ----------------------------------------------------
            */

            const logChannel =
                interaction.guild.channels.cache.get(
                    WARNING_LOG_CHANNEL_ID
                );

            if (logChannel) {

                const logEmbed =
                    new EmbedBuilder()
                        .setTitle(
                            '✅ Warning Removed'
                        )
                        .setColor(
                            0x57f287
                        )
                        .addFields(
                            {
                                name: '👤 Member',
                                value:
                                    `${member.user} ` +
                                    `(\`${member.id}\`)`
                            },
                            {
                                name: '🛡️ Previous Warn Level',
                                value:
                                    `${warningLevel}/3`
                            },
                            {
                                name: '🛡️ Current Warn Level',
                                value:
                                    `${newWarningLevel}/3`
                            },
                            {
                                name: '👮 Moderator',
                                value:
                                    `${interaction.user} ` +
                                    `(\`${interaction.user.id}\`)`
                            }
                        )
                        .setTimestamp();

                await logChannel.send({
                    embeds: [
                        logEmbed
                    ]
                });
            }

            return interaction.reply({
                content:
                    `✅ Removed one warning from ${member}.\n` +
                    `**Warning Level:** ${newWarningLevel}/3`
            });
        }


        /*
        ========================================================
        /applications
        /*
        ========================================================
        */

        if (interaction.commandName !== 'applications') {
            return;
        }

        const isStaff = STAFF_ROLE_IDS.some(roleId =>
            interaction.member.roles.cache.has(roleId)
        );

        if (!isStaff) {
            return interaction.reply({
                content:
                    '❌ You do not have permission to manage applications.',
                ephemeral: true
            });
        }

        let settings = await ApplicationSettings.findOne({
            key: 'staff_applications'
        });

        if (!settings) {
            settings = await ApplicationSettings.create({
                key: 'staff_applications',
                open: true
            });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('applications_open')
                    .setLabel('Open Applications')
                    .setEmoji('🟢')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('applications_close')
                    .setLabel('Close Applications')
                    .setEmoji('🔴')
                    .setStyle(ButtonStyle.Danger)
            );

        return interaction.reply({
            content:
                `📋 **Staff Applications**\n\n` +
                `Current status: ${
                    settings.open
                        ? '🟢 OPEN'
                        : '🔴 CLOSED'
                }`,
            components: [row],
            ephemeral: true
        });
    }

    /*
    ============================================================
    SUPPORT DROPDOWN
    ============================================================
    */

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId !== 'support_dropdown') {
            return;
        }

        const choice = interaction.values[0];

        console.log(
            '🎫 Support choice:',
            choice
        );

        if (choice === 'general_support') {
            return showGeneralSupportModal(interaction);
        }

        if (choice === 'bug_report') {
            return showBugReportModal(interaction);
        }

        if (choice === 'player_report') {
            return showPlayerReportModal(interaction);
        }

        if (choice === 'gang_application') {
            const modal = new ModalBuilder()
                .setCustomId('gang_application')
                .setTitle('Gang Application');

            const gangName = new TextInputBuilder()
                .setCustomId('gang_name')
                .setLabel('What is your gang name?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(100);

            const gangLeader = new TextInputBuilder()
                .setCustomId('gang_leader')
                .setLabel("Gang leader's Roblox username")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(100);

            const gangMembers = new TextInputBuilder()
                .setCustomId('gang_members')
                .setLabel('How many members are in your gang?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(20);

            const gangShortForm = new TextInputBuilder()
                .setCustomId('gang_short_form')
                .setLabel('What is your gang short form?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(50);

            const gangOwners = new TextInputBuilder()
                .setCustomId('gang_owners')
                .setLabel('Who are the gang owners?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(500);

            modal.addComponents(
                new ActionRowBuilder().addComponents(gangName),
                new ActionRowBuilder().addComponents(gangLeader),
                new ActionRowBuilder().addComponents(gangMembers),
                new ActionRowBuilder().addComponents(gangShortForm),
                new ActionRowBuilder().addComponents(gangOwners)
            );

            return interaction.showModal(modal);
        }

        if (choice === 'other') {
            return showOtherModal(interaction);
        }

        if (choice === 'content_creator_application') {
            return showContentCreatorApplicationModal(interaction);
        }

        if (choice === 'staff_application') {

            const settings =
                await ApplicationSettings.findOne({
                    key: 'staff_applications'
                });

            if (settings && !settings.open) {
                return interaction.reply({
                    content:
                        '🔴 Staff applications are currently closed. Please try again later.'
                });
            }

            const existingApplication =
                await Application.findOne({
                    userId: interaction.user.id
                }).sort({
                    submittedAt: -1
                });

            if (
                existingApplication &&
                existingApplication.cooldownUntil &&
                existingApplication.cooldownUntil > new Date()
            ) {

                const remaining =
                    existingApplication.cooldownUntil -
                    new Date();

                const hours = Math.ceil(
                    remaining /
                    (1000 * 60 * 60)
                );

                return interaction.reply({
                    content:
                        `❌ You cannot submit another staff application yet. ` +
                        `Please wait approximately **${hours} hour(s)**.`
                });
            }

            return showApplicationModal(interaction);
        }

        return;
    }

    /*
    ============================================================
    MODALS
    ============================================================
    */

    if (
        interaction.isModalSubmit() &&
        interaction.customId === 'gang_application'
    ) {
        try {
            const gangName = interaction.fields.getTextInputValue('gang_name');
            const gangLeader = interaction.fields.getTextInputValue('gang_leader');
            const gangMembers = interaction.fields.getTextInputValue('gang_members');
            const gangShortForm = interaction.fields.getTextInputValue('gang_short_form');
            const gangOwners = interaction.fields.getTextInputValue('gang_owners');

            const applicationChannel =
                interaction.client.channels.cache.get(
                    '1554518185494192200'
                );

            if (!applicationChannel) {
                return interaction.reply({
                    content: '❌ The Gang application channel could not be found.',
                    ephemeral: true
                });
            }

            const applicationEmbed = new EmbedBuilder()
                .setTitle('🏴 New Gang Application')
                .setColor(0x2b2d31)
                .addFields(
                    {
                        name: '👤 Applicant',
                        value: `${interaction.user} (\`${interaction.user.id}\`)`
                    },
                    {
                        name: '🏴 Gang Name',
                        value: gangName
                    },
                    {
                        name: '👑 Gang Leader',
                        value: gangLeader
                    },
                    {
                        name: '👥 Gang Members',
                        value: gangMembers
                    },
                    {
                        name: '🔤 Gang Short Form',
                        value: gangShortForm
                    },
                    {
                        name: '👑 Gang Owners',
                        value: gangOwners
                    }
                )
                .setTimestamp();

            const reviewRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`gang_accept_${interaction.user.id}`)
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId(`gang_decline_${interaction.user.id}`)
                        .setLabel('Decline')
                        .setStyle(ButtonStyle.Danger)
                );

            await applicationChannel.send({
                embeds: [applicationEmbed],
                components: [reviewRow]
            });

            return interaction.reply({
                content:
                    '✅ **Gang application submitted!**\n\n' +
                    'Your application has been sent to the War Grounds staff team.\n' +
                    'You will be notified when it has been reviewed.',
                ephemeral: true
            });

        } catch (error) {
            console.error(
                '❌ Gang application submission error:',
                error
            );

            if (!interaction.replied && !interaction.deferred) {
                return interaction.reply({
                    content:
                        '❌ Something went wrong while submitting your Gang application.',
                    ephemeral: true
                });
            }
        }

        return;
    }

    if (interaction.isModalSubmit()) {


        /*
        ========================================================
        STAFF APPLICATION
        /*
        ========================================================
        */

        if (interaction.customId === 'staff_application') {

            try {

                const existingApplication =
                    await Application.findOne({
                        userId: interaction.user.id
                    }).sort({
                        submittedAt: -1
                    });

                if (
                    existingApplication &&
                    existingApplication.cooldownUntil &&
                    existingApplication.cooldownUntil > new Date()
                ) {

                    return interaction.reply({
                        content:
                            '❌ You cannot submit another staff application yet. ' +
                            'Please wait 48 hours between applications.'
                    });
                }

                const robloxUsername =
                    interaction.fields.getTextInputValue(
                        'roblox_username'
                    );

                const experience =
                    interaction.fields.getTextInputValue(
                        'experience'
                    );

                const whyStaff =
                    interaction.fields.getTextInputValue(
                        'why_staff'
                    );

                const whyYou =
                    interaction.fields.getTextInputValue(
                        'why_you'
                    );

                const activity =
                    interaction.fields.getTextInputValue(
                        'activity'
                    );

                const application =
                    new Application({
                        userId: interaction.user.id,
                        robloxUsername,
                        experience,
                        whyStaff,
                        whyYou,
                        activity,
                        status: 'pending',
                        submittedAt: new Date(),
                        cooldownUntil: new Date(
                            Date.now() +
                            48 * 60 * 60 * 1000
                        )
                    });

                await application.save();

                const applicationChannel =
                    interaction.client.channels.cache.get(
                        APPLICATION_CHANNEL_ID
                    );

                if (!applicationChannel) {

                    console.error(
                        '❌ Application channel not found.'
                    );

                    return interaction.reply({
                        content:
                            '❌ The application channel could not be found.'
                    });
                }

                const applicationEmbed =
                    new EmbedBuilder()
                        .setTitle(
                            '📋 New Staff Application'
                        )
                        .setColor(0x2b2d31)
                        .addFields(
                            {
                                name: '👤 Applicant',
                                value:
                                    `${interaction.user} ` +
                                    `(\`${interaction.user.id}\`)`
                            },
                            {
                                name: '🎮 Roblox Username',
                                value: robloxUsername
                            },
                            {
                                name: '🛡️ Previous Staff Experience',
                                value: experience
                            },
                            {
                                name:
                                    '❓ Why do you want to become staff?',
                                value: whyStaff
                            },
                            {
                                name:
                                    '⭐ Why should we choose you?',
                                value: whyYou
                            },
                            {
                                name: '⏰ Activity',
                                value: activity
                            }
                        )
                        .setTimestamp();

                const reviewRow =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId(
                                    `application_accept_${application._id}`
                                )
                                .setLabel('Accept')
                                .setStyle(
                                    ButtonStyle.Success
                                ),

                            new ButtonBuilder()
                                .setCustomId(
                                    `application_decline_${application._id}`
                                )
                                .setLabel('Decline')
                                .setStyle(
                                    ButtonStyle.Danger
                                )
                        );

                await applicationChannel.send({
                    embeds: [
                        applicationEmbed
                    ],
                    components: [
                        reviewRow
                    ]
                });

                return interaction.reply({
                    content:
                        '✅ **Application submitted successfully!**\n\n' +
                        'Your application has been sent to the War Grounds staff team.\n' +
                        'You may apply again after the 48-hour cooldown.'
                });

            } catch (error) {

                console.error(
                    '❌ Application submission error:',
                    error
                );

                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    return interaction.reply({
                        content:
                            '❌ Something went wrong while submitting your application.',
                        ephemeral: true
                    });
                }
            }

            return;
        }

        /*
        ========================================================
        CONTENT CREATOR APPLICATION
        /*
        ========================================================
        */

        if (
            interaction.customId ===
            'content_creator_application'
        ) {

            try {

                await interaction.deferReply({
                    ephemeral: true
                });

                const platform =
                    interaction.fields.getTextInputValue(
                        'platform'
                    );

                const contentUsername =
                    interaction.fields.getTextInputValue(
                        'content_username'
                    );

                const followers =
                    interaction.fields.getTextInputValue(
                        'followers'
                    );

                const content =
                    interaction.fields.getTextInputValue(
                        'content'
                    );

                const whyCreator =
                    interaction.fields.getTextInputValue(
                        'why_creator'
                    );

                const applicationChannel =
                    interaction.client.channels.cache.get(
                        CONTENT_CREATOR_REVIEW_CHANNEL_ID
                    );

                if (!applicationChannel) {

                    console.error(
                        '❌ Content Creator review channel not found.'
                    );

                    return interaction.reply({
                        content:
                            '❌ The Content Creator application channel could not be found.',
                        ephemeral: true
                    });
                }

                const applicationEmbed =
                    new EmbedBuilder()
                        .setTitle(
                            '🎥 New Content Creator Application'
                        )
                        .setColor(0x2b2d31)
                        .addFields(
                            {
                                name: '👤 Applicant',
                                value:
                                    `${interaction.user} ` +
                                    `(\`${interaction.user.id}\`)`
                            },
                            {
                                name: '📱 Platform',
                                value: platform
                            },
                            {
                                name: '📺 Channel / Username',
                                value: contentUsername
                            },
                            {
                                name: '👥 Followers / Subscribers',
                                value: followers
                            },
                            {
                                name: '🎬 Content',
                                value: content
                            },
                            {
                                name: '⭐ Why should War Grounds choose you?',
                                value: whyCreator
                            }
                        )
                        .setTimestamp();

                const reviewRow =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId(
                                    `content_creator_accept_${interaction.user.id}`
                                )
                                .setLabel('Accept')
                                .setStyle(
                                    ButtonStyle.Success
                                ),

                            new ButtonBuilder()
                                .setCustomId(
                                    `content_creator_decline_${interaction.user.id}`
                                )
                                .setLabel('Decline')
                                .setStyle(
                                    ButtonStyle.Danger
                                )
                        );

                await applicationChannel.send({
                    embeds: [
                        applicationEmbed
                    ],
                    components: [
                        reviewRow
                    ]
                });

                return interaction.editReply({
                    content:
                        '✅ **Content Creator application submitted!**\n\n' +
                        'Your application has been sent to the War Grounds staff team.\n' +
                        'You will be notified when it has been reviewed.'
                });

            } catch (error) {

                console.error(
                    '❌ Content Creator application error:',
                    error
                );

                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    return interaction.reply({
                        content:
                            '❌ Something went wrong while submitting your Content Creator application.',
                        ephemeral: true
                    });
                }
            }

            return;
}

/*
============================================================
GENERAL SUPPORT
============================================================
*/

        if (interaction.customId === 'general_support') {

            try {

                const message =
                    interaction.fields.getTextInputValue(
                        'support_message'
                    );

                const guild =
                    getSupportGuild(
                        interaction.client
                    );

                if (!guild) {

                    return interaction.reply({
                        content:
                            '❌ War Grounds server could not be found.'
                    });
                }

                const permissionOverwrites = [

                    {
                        id: guild.id,
                        deny: [
                            PermissionFlagsBits.ViewChannel
                        ]
                    },

                    {
                        id: interaction.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels
                        ]
                    },

                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }

                ];

                for (
                    const roleId of STAFF_ROLE_IDS
                ) {

                    permissionOverwrites.push({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    });
                }

                const ticket =
                    await guild.channels.create({

                        name:
                            `general-support-${interaction.user.username}`
                                .toLowerCase()
                                .replace(
                                    /[^a-z0-9-]/g,
                                    '-'
                                )
                                .slice(0, 90),

                        type:
                            ChannelType.GuildText,

                        parent:
                            SUPPORT_TICKET_CATEGORY_ID,

                        permissionOverwrites

                    });

                await ticket.send({

                    content:
                        `${STAFF_ROLE_IDS
                            .map(
                                roleId =>
                                    `<@&${roleId}>`
                            )
                            .join(' ')}\n` +
                        `<@${interaction.user.id}>`,

                    embeds: [

                        new EmbedBuilder()
                            .setTitle(
                                '🎫 General Support'
                            )
                            .setDescription(
                                'A new General Support ticket has been created.'
                            )
                            .setColor(0x2b2d31)
                            .addFields(
                                {
                                    name: '👤 User',
                                    value:
                                        `${interaction.user} ` +
                                        `(\`${interaction.user.id}\`)`
                                },
                                {
                                    name: '💬 Message',
                                    value: message
                                }
                            )
                            .setTimestamp()

                    ],

                    components: [

                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setCustomId(
                                        'close_support_ticket'
                                    )
                                    .setLabel(
                                        'Close Ticket'
                                    )
                                    .setEmoji('🔒')
                                    .setStyle(
                                        ButtonStyle.Danger
                                    )

                            )

                    ]

                });

                return interaction.reply({
                    content:
                        `✅ Your support ticket has been created!\n\n` +
                        `🎫 ${ticket}`
                });

            } catch (error) {

                console.error(
                    '❌ General support ticket error:',
                    error
                );

                return interaction.reply({
                    content:
                        '❌ Something went wrong while creating your support ticket.'
                });
            }
        }


        /*
        ========================================================
        BUG REPORT
        /*
        ========================================================
        */

        if (interaction.customId === 'bug_report') {

            try {

                const bug =
                    interaction.fields.getTextInputValue(
                        'bug_description'
                    );

                const guild =
                    getSupportGuild(
                        interaction.client
                    );

                if (!guild) {

                    return interaction.reply({
                        content:
                            '❌ War Grounds server could not be found.'
                    });
                }

                const permissionOverwrites = [

                    {
                        id: guild.id,
                        deny: [
                            PermissionFlagsBits.ViewChannel
                        ]
                    },

                    {
                        id: interaction.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels
                        ]
                    },

                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }

                ];

                for (
                    const roleId of STAFF_ROLE_IDS
                ) {

                    permissionOverwrites.push({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    });
                }

                const ticket =
                    await guild.channels.create({

                        name:
                            `bug-report-${interaction.user.username}`
                                .toLowerCase()
                                .replace(
                                    /[^a-z0-9-]/g,
                                    '-'
                                )
                                .slice(0, 90),

                        type:
                            ChannelType.GuildText,

                        parent:
                            SUPPORT_TICKET_CATEGORY_ID,

                        permissionOverwrites

                    });

                await ticket.send({

                    content:
                        `${STAFF_ROLE_IDS
                            .map(
                                roleId =>
                                    `<@&${roleId}>`
                            )
                            .join(' ')}\n` +
                        `<@${interaction.user.id}>`,

                    embeds: [

                        new EmbedBuilder()
                            .setTitle(
                                '🐛 Bug Report'
                            )
                            .setDescription(
                                'A new Bug Report ticket has been created.'
                            )
                            .setColor(0x2b2d31)
                            .addFields(
                                {
                                    name: '👤 Reporter',
                                    value:
                                        `${interaction.user} ` +
                                        `(\`${interaction.user.id}\`)`
                                },
                                {
                                    name: '🐛 Bug Description',
                                    value: bug
                                }
                            )
                            .setTimestamp()

                    ],

                    components: [

                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setCustomId(
                                        'close_support_ticket'
                                    )
                                    .setLabel(
                                        'Close Ticket'
                                    )
                                    .setEmoji('🔒')
                                    .setStyle(
                                        ButtonStyle.Danger
                                    )

                            )

                    ]

                });

                return interaction.reply({
                    content:
                        `✅ Your bug report ticket has been created!\n\n` +
                        `🎫 ${ticket}`
                });

            } catch (error) {

                console.error(
                    '❌ Bug report ticket error:',
                    error
                );

                return interaction.reply({
                    content:
                        '❌ Something went wrong while creating your bug report ticket.'
                });
            }
        }


        /*
        ========================================================
        PLAYER REPORT
        /*
        ========================================================
        */

        if (interaction.customId === 'player_report') {

            try {

                const reportedPlayer =
                    interaction.fields.getTextInputValue(
                        'reported_player'
                    );

                const reason =
                    interaction.fields.getTextInputValue(
                        'report_reason'
                    );

                const guild =
                    getSupportGuild(
                        interaction.client
                    );

                if (!guild) {

                    return interaction.reply({
                        content:
                            '❌ War Grounds server could not be found.'
                    });
                }

                const permissionOverwrites = [

                    {
                        id: guild.id,
                        deny: [
                            PermissionFlagsBits.ViewChannel
                        ]
                    },

                    {
                        id: interaction.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels
                        ]
                    },

                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }

                ];

                for (
                    const roleId of STAFF_ROLE_IDS
                ) {

                    permissionOverwrites.push({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    });
                }

                const ticket =
                    await guild.channels.create({

                        name:
                            `player-report-${interaction.user.username}`
                                .toLowerCase()
                                .replace(
                                    /[^a-z0-9-]/g,
                                    '-'
                                )
                                .slice(0, 90),

                        type:
                            ChannelType.GuildText,

                        parent:
                            SUPPORT_TICKET_CATEGORY_ID,

                        permissionOverwrites

                    });

                await ticket.send({

                    content:
                        `${STAFF_ROLE_IDS
                            .map(
                                roleId =>
                                    `<@&${roleId}>`
                            )
                            .join(' ')}\n` +
                        `<@${interaction.user.id}>`,

                    embeds: [

                        new EmbedBuilder()
                            .setTitle(
                                '👤 Player Report'
                            )
                            .setColor(0x2b2d31)
                            .addFields(
                                {
                                    name: '👤 Reporter',
                                    value:
                                        `${interaction.user} ` +
                                        `(\`${interaction.user.id}\`)`
                                },
                                {
                                    name:
                                        '🎮 Reported Roblox Username',
                                    value: reportedPlayer
                                },
                                {
                                    name: '📝 Reason',
                                    value: reason
                                }
                            )
                            .setTimestamp()

                    ],

                    components: [

                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setCustomId(
                                        'close_support_ticket'
                                    )
                                    .setLabel(
                                        'Close Ticket'
                                    )
                                    .setEmoji('🔒')
                                    .setStyle(
                                        ButtonStyle.Danger
                                    )

                            )

                    ]

                });

                return interaction.reply({
                    content:
                        `✅ Your player report ticket has been created!\n\n` +
                        `🎫 ${ticket}`
                });

            } catch (error) {

                console.error(
                    '❌ Player report ticket error:',
                    error
                );

                return interaction.reply({
                    content:
                        '❌ Something went wrong while creating your player report ticket.'
                });
            }
        }


        /*
        ========================================================
        OTHER SUPPORT
        /*
        ========================================================
        */

        if (interaction.customId === 'other_support') {

            try {

                const message =
                    interaction.fields.getTextInputValue(
                        'other_message'
                    );

                const guild =
                    getSupportGuild(
                        interaction.client
                    );

                if (!guild) {

                    return interaction.reply({
                        content:
                            '❌ War Grounds server could not be found.'
                    });
                }

                const permissionOverwrites = [

                    {
                        id: guild.id,
                        deny: [
                            PermissionFlagsBits.ViewChannel
                        ]
                    },

                    {
                        id: interaction.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels
                        ]
                    },

                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }

                ];

                for (
                    const roleId of STAFF_ROLE_IDS
                ) {

                    permissionOverwrites.push({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    });
                }

                const ticket =
                    await guild.channels.create({

                        name:
                            `other-${interaction.user.username}`
                                .toLowerCase()
                                .replace(
                                    /[^a-z0-9-]/g,
                                    '-'
                                )
                                .slice(0, 90),

                        type:
                            ChannelType.GuildText,

                        parent:
                            SUPPORT_TICKET_CATEGORY_ID,

                        permissionOverwrites

                    });

                await ticket.send({

                    content:
                        `${STAFF_ROLE_IDS
                            .map(
                                roleId =>
                                    `<@&${roleId}>`
                            )
                            .join(' ')}\n` +
                        `<@${interaction.user.id}>`,

                    embeds: [

                        new EmbedBuilder()
                            .setTitle(
                                '❓ Other Support'
                            )
                            .setColor(0x2b2d31)
                            .addFields(
                                {
                                    name: '👤 User',
                                    value:
                                        `${interaction.user} ` +
                                        `(\`${interaction.user.id}\`)`
                                },
                                {
                                    name: '💬 Message',
                                    value: message
                                }
                            )
                            .setTimestamp()

                    ],

                    components: [

                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setCustomId(
                                        'close_support_ticket'
                                    )
                                    .setLabel(
                                        'Close Ticket'
                                    )
                                    .setEmoji('🔒')
                                    .setStyle(
                                        ButtonStyle.Danger
                                    )

                                )

                    ]

                });

                return interaction.reply({
                    content:
                        `✅ Your support ticket has been created!\n\n` +
                        `🎫 ${ticket}`
                });

            } catch (error) {

                console.error(
                    '❌ Other support ticket error:',
                    error
                );

                return interaction.reply({
                    content:
                        '❌ Something went wrong while creating your support ticket.'
                });
            }
        }

        return;
    }

    /*
    ============================================================
    BUTTONS
    ============================================================
    */

    if (!interaction.isButton()) {
        return;
    }
    /*
    ============================================================
    CONTENT CREATOR APPLICATION ACCEPT / DECLINE
    ============================================================
    */

    if (
        interaction.customId.startsWith('content_creator_accept_') ||
        interaction.customId.startsWith('content_creator_decline_')
    ) {

        try {

            await interaction.deferReply({
                ephemeral: true
            });

            const isStaff = CONTENT_CREATOR_STAFF_ROLE_IDS.some(
                roleId =>
                    interaction.member.roles.cache.has(roleId)
            );

            if (!isStaff) {
                return interaction.editReply({
                    content:
                        '❌ You do not have permission to review Content Creator Applications.'
                });
            }

            const parts = interaction.customId.split('_');
            const action = parts[2];
            const applicantId = parts[3];

            const applicant =
                await interaction.client.users.fetch(
                    applicantId
                );

            if (action === 'decline') {

                try {
                    await applicant.send(
                        '❌ **Content Creator Application Declined**\n\n' +
                        'Your Content Creator Application for **War Grounds** has been declined by the staff team.'
                    );
                } catch (dmError) {
                    console.log(
                        '⚠️ Could not DM the Content Creator applicant.'
                    );
                }

                await interaction.message.edit({
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    'content_creator_application_declined'
                                )
                                .setLabel('Declined')
                                .setStyle(ButtonStyle.Danger)
                                .setDisabled(true)
                        )
                    ]
                });

                return interaction.editReply({
                    content:
                        '✅ Content Creator Application declined.'
                });
            }

            if (action === 'accept') {

                const guild = interaction.guild;

                if (!guild) {
                    return interaction.editReply({
                        content:
                            '❌ This action can only be used inside the War Grounds server.'
                    });
                }

                const permissionOverwrites = [
                    {
                        id: guild.id,
                        deny: [
                            PermissionFlagsBits.ViewChannel
                        ]
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels
                        ]
                    },
                    {
                        id: applicantId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }
                ];

                for (const roleId of CONTENT_CREATOR_STAFF_ROLE_IDS) {
                    permissionOverwrites.push({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    });
                }

                const ticket =
                    await guild.channels.create({
                        name:
                            `content-creator-${applicantId.slice(-6)}`,
                        type:
                            ChannelType.GuildText,
                        parent:
                            CONTENT_CREATOR_TICKET_CATEGORY_ID,
                        permissionOverwrites
                    });

                await ticket.send({
                    content:
                        `${CONTENT_CREATOR_STAFF_ROLE_IDS
                            .map(roleId => `<@&${roleId}>`)
                            .join(' ')}\n` +
                        `<@${applicantId}>`,

                    embeds: [
                        new EmbedBuilder()
                            .setTitle(
                                '🎥 Content Creator Application'
                            )
                            .setDescription(
                                'This private ticket has been created for the Content Creator Application.'
                            )
                            .setColor(0x57F287)
                            .addFields({
                                name: '👤 Applicant',
                                value:
                                    `<@${applicantId}>`
                            })
                            .setTimestamp()
                    ],

                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    'close_content_creator_ticket'
                                )
                                .setLabel('Close Ticket')
                                .setEmoji('🔒')
                                .setStyle(
                                    ButtonStyle.Danger
                                )
                        )
                    ]
                });

                try {
                    await applicant.send(
                        '✅ **Content Creator Application Accepted!**\n\n' +
                        'Your Content Creator Application has been accepted.\n\n' +
                        `A private ticket has been created in the War Grounds server: ${ticket}`
                    );
                } catch (dmError) {
                    console.log(
                        '⚠️ Could not DM the Content Creator applicant.'
                    );
                }

                await interaction.message.edit({
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    'content_creator_application_accepted'
                                )
                                .setLabel('Accepted')
                                .setStyle(
                                    ButtonStyle.Success
                                )
                                .setDisabled(true)
                        )
                    ]
                });

                return interaction.editReply({
                    content:
                        `✅ Content Creator Application accepted and ticket created: ${ticket}`
                });
            }

            return interaction.editReply({
                content:
                    '❌ Invalid Content Creator Application action.'
            });

        } catch (error) {

            console.error(
                '❌ Content Creator application review error:',
                error
            );

            if (
                interaction.deferred &&
                !interaction.replied
            ) {
                return interaction.editReply({
                    content:
                        '❌ Something went wrong while reviewing the Content Creator Application.'
                });
            }
        }

        return;
    }

    /*
    ============================================================
    GANG APPLICATION ACCEPT / DECLINE
    ============================================================
    */

    if (
        interaction.customId.startsWith('gang_accept_') ||
        interaction.customId.startsWith('gang_decline_')
    ) {

        try {

            await interaction.deferReply({
                ephemeral: true
            });

            const isStaff = STAFF_ROLE_IDS.some(
                roleId =>
                    interaction.member.roles.cache.has(roleId)
            );

            if (!isStaff) {
                return interaction.editReply({
                    content:
                        '❌ You do not have permission to review Gang Applications.'
                });
            }

            const parts = interaction.customId.split('_');
            const action = parts[1];
            const applicantId = parts[2];

            const applicant =
                await interaction.client.users.fetch(
                    applicantId
                );

            if (action === 'decline') {

                try {
                    await applicant.send(
                        '❌ **Gang Application Declined**\n\n' +
                        'Your Gang Application for **War Grounds** has been declined by the staff team.'
                    );
                } catch (dmError) {
                    console.log(
                        '⚠️ Could not DM the Gang applicant.'
                    );
                }

                await interaction.message.edit({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(
                                        'gang_application_declined'
                                    )
                                    .setLabel('Declined')
                                    .setStyle(ButtonStyle.Danger)
                                    .setDisabled(true)
                            )
                    ]
                });

                return interaction.editReply({
                    content:
                        '✅ Gang Application declined.'
                });
            }

            if (action === 'accept') {

                const guild = interaction.guild;

                if (!guild) {
                    return interaction.editReply({
                        content:
                            '❌ This action can only be used inside the War Grounds server.'
                    });
                }

                const permissionOverwrites = [
                    {
                        id: guild.id,
                        deny: [
                            PermissionFlagsBits.ViewChannel
                        ]
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels
                        ]
                    },
                    {
                        id: applicantId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }
                ];

                for (const roleId of STAFF_ROLE_IDS) {
                    permissionOverwrites.push({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    });
                }

                const ticket =
                    await guild.channels.create({
                        name:
                            `gang-${applicantId.slice(-6)}`,

                        type:
                            ChannelType.GuildText,

                        parent:
                            '1553514929318002938',

                        permissionOverwrites
                    });

                await ticket.send({
                    content:
                        `${STAFF_ROLE_IDS
                            .map(
                                roleId =>
                                    `<@&${roleId}>`
                            )
                            .join(' ')}\n` +
                        `<@${applicantId}>`,

                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🏴 Gang Application')
                            .setDescription(
                                'This private ticket has been created for the Gang Application.'
                            )
                            .setColor(0x57F287)
                            .addFields({
                                name: '👤 Applicant',
                                value: `<@${applicantId}>`
                            })
                            .setTimestamp()
                    ],

                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(
                                        'close_gang_ticket'
                                    )
                                    .setLabel('Close Ticket')
                                    .setEmoji('🔒')
                                    .setStyle(ButtonStyle.Danger)
                            )
                    ]
                });

                try {
                    await applicant.send(
                        '✅ **Gang Application Accepted!**\n\n' +
                        'Your Gang Application has been accepted.\n\n' +
                        `A private ticket has been created in the War Grounds server: ${ticket}`
                    );
                } catch (dmError) {
                    console.log(
                        '⚠️ Could not DM the Gang applicant.'
                    );
                }

                await interaction.message.edit({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(
                                        'gang_application_accepted'
                                    )
                                    .setLabel('Accepted')
                                    .setStyle(ButtonStyle.Success)
                                    .setDisabled(true)
                            )
                    ]
                });

                return interaction.editReply({
                    content:
                        `✅ Gang Application accepted and ticket created: ${ticket}`
                });
            }

            return interaction.editReply({
                content:
                    '❌ Invalid Gang Application action.'
            });

        } catch (error) {

            console.error(
                '❌ Gang application review error:',
                error
            );

            if (
                interaction.deferred &&
                !interaction.replied
            ) {
                return interaction.editReply({
                    content:
                        '❌ Something went wrong while reviewing the Gang Application.'
                });
            }

            if (
                !interaction.replied &&
                !interaction.deferred
            ) {
                return interaction.reply({
                    content:
                        '❌ Something went wrong while reviewing the Gang Application.',
                    ephemeral: true
                });
            }
        }

        return;
    }

    /*
    ============================================================
    APPLICATION OPEN / CLOSE
    ============================================================
    */

    if (
        interaction.customId === 'applications_open' ||
        interaction.customId === 'applications_close'
    ) {

        try {

            const isStaff = STAFF_ROLE_IDS.some(
                roleId =>
                    interaction.member.roles.cache.has(
                        roleId
                    )
            );

            if (!isStaff) {

                return interaction.reply({
                    content:
                        '❌ You do not have permission to manage applications.',
                    ephemeral: true
                });
            }

            let settings =
                await ApplicationSettings.findOne({
                    key: 'staff_applications'
                });

            if (!settings) {

                settings =
                    new ApplicationSettings({
                        key: 'staff_applications',
                        open: true
                    });
            }

            if (
                interaction.customId ===
                'applications_open'
            ) {

                settings.open = true;

                await settings.save();

                return interaction.update({
                    content:
                        '📋 **Staff Applications**\n\n' +
                        'Current status: 🟢 **OPEN**',
                    components:
                        interaction.message.components
                });
            }

            settings.open = false;

            await settings.save();

            return interaction.update({
                content:
                    '📋 **Staff Applications**\n\n' +
                    'Current status: 🔴 **CLOSED**',
                components:
                    interaction.message.components
            });

        } catch (error) {

            console.error(
                '❌ Application settings error:',
                error
            );

            if (
                !interaction.replied &&
                !interaction.deferred
            ) {

                return interaction.reply({
                    content:
                        '❌ Something went wrong while changing application status.',
                    ephemeral: true
                });
            }
        }
    }

    /*
    ============================================================
    CLOSE GANG TICKET
    ============================================================
    */

    if (interaction.customId === 'close_content_creator_ticket') {

        try {

            const isStaff =
                CONTENT_CREATOR_STAFF_ROLE_IDS.some(
                    roleId =>
                        interaction.member.roles.cache.has(roleId)
                );

            if (!isStaff) {
                return interaction.reply({
                    content:
                        '❌ You do not have permission to close this ticket.',
                    ephemeral: true
                });
            }

            await interaction.reply({
                content:
                    '🔒 Closing this Content Creator ticket in 5 seconds...'
            });

            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch (error) {
                    console.error(
                        '❌ Failed to delete Content Creator ticket:',
                        error
                    );
                }
            }, 5000);

        } catch (error) {

            console.error(
                '❌ Content Creator ticket close error:',
                error
            );

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content:
                        '❌ Something went wrong while closing this ticket.',
                    ephemeral: true
                });
            }
        }

        return;
    }

    if (interaction.customId === 'close_gang_ticket') {

        const isStaff = STAFF_ROLE_IDS.some(
            roleId =>
                interaction.member.roles.cache.has(roleId)
        );

        if (!isStaff) {
            return interaction.reply({
                content:
                    '❌ You do not have permission to close this ticket.',
                ephemeral: true
            });
        }

        await interaction.reply({
            content:
                '🔒 This Gang ticket will be closed in 5 seconds.'
        });

        setTimeout(
            async () => {

                try {
                    await interaction.channel.delete();
                } catch (error) {
                    console.error(
                        '❌ Failed to delete Gang ticket:',
                        error
                    );
                }

            },
            5000
        );

        return;
    }

    /*
    ============================================================
    CLOSE SUPPORT TICKET
    ============================================================
    */

    if (
        interaction.customId ===
        'close_support_ticket'
    ) {

        const isStaff =
            STAFF_ROLE_IDS.some(
                roleId =>
                    interaction.member.roles.cache.has(
                        roleId
                    )
            );

        if (!isStaff) {

            return interaction.reply({
                content:
                    '❌ You do not have permission to close this ticket.',
                ephemeral: true
            });
        }

        await interaction.reply({
            content:
                '🔒 This support ticket will be closed in 5 seconds.'
        });

        setTimeout(
            async () => {

                try {

                    await interaction.channel.delete();

                } catch (error) {

                    console.error(
                        '❌ Failed to delete support ticket:',
                        error
                    );
                }

            },
            5000
        );

        return;
    }

    /*
    ============================================================
    CLOSE STAFF TICKET
    ============================================================
    */

    if (
        interaction.customId ===
        'close_staff_ticket'
    ) {

        const isStaff =
            STAFF_ROLE_IDS.some(
                roleId =>
                    interaction.member.roles.cache.has(
                        roleId
                    )
            );

        if (!isStaff) {

            return interaction.reply({
                content:
                    '❌ You do not have permission to close this ticket.',
                ephemeral: true
            });
        }

        await interaction.reply({
            content:
                '🔒 Closing this ticket in 5 seconds...'
        });

        setTimeout(
            async () => {

                try {

                    await interaction.channel.delete();

                } catch (error) {

                    console.error(
                        '❌ Could not delete ticket:',
                        error
                    );
                }

            },
            5000
        );

        return;
    }

    /*
    ============================================================
    APPLICATION ACCEPT / DECLINE
    ============================================================
    */

    const [
        action,
        type,
        applicationId
    ] = interaction.customId.split('_');

    if (
        action !== 'application' ||
        (
            type !== 'accept' &&
            type !== 'decline'
        )
    ) {

        return;
    }

    const application =
        await Application.findById(
            applicationId
        );

    if (!application) {

        return interaction.reply({
            content:
                '❌ Application not found.',
            ephemeral: true
        });
    }

    if (
        application.status !==
        'pending'
    ) {

        return interaction.reply({
            content:
                '❌ This application has already been reviewed.',
            ephemeral: true
        });
    }

    const isStaff =
        STAFF_ROLE_IDS.some(
            roleId =>
                interaction.member.roles.cache.has(
                    roleId
                )
        );

    if (!isStaff) {

        return interaction.reply({
            content:
                '❌ You do not have permission to review applications.',
            ephemeral: true
        });
    }

    /*
    ============================================================
    ACCEPT APPLICATION
    ============================================================
    */

    if (type === 'accept') {

        try {

            application.status =
                'accepted';

            application.reviewedAt =
                new Date();

            application.reviewedBy =
                interaction.user.id;

            await application.save();

            const applicant =
                await interaction.client.users.fetch(
                    application.userId
                );

  const ticketName =
    `staff-application-${application._id.toString().slice(-6)}`;

            const permissionOverwrites = [

                {
                    id:
                        interaction.guild.id,

                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                },

                {
                    id:
                        interaction.client.user.id,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageChannels
                    ]
                },

                {
                    id:
                        application.userId,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }

            ];

            for (
                const roleId of STAFF_ROLE_IDS
            ) {

                permissionOverwrites.push({

                    id: roleId,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]

                });
            }

            const ticket =
                await interaction.guild.channels.create({

                    name:
                        ticketName,

                    type:
                        ChannelType.GuildText,

                    parent:
                        TICKET_CATEGORY_ID,

                    permissionOverwrites

                });

            await ticket.send({

                content:
                    `${STAFF_ROLE_IDS
                        .map(
                            roleId =>
                                `<@&${roleId}>`
                        )
                        .join(' ')}\n` +
                    `<@${application.userId}>`,

                embeds: [

                    new EmbedBuilder()
                        .setTitle(
                            '📋 Staff Application'
                        )
                        .setDescription(
                            'This is the private staff application ticket.\n\n' +
                            'Staff can discuss the application here with the applicant.'
                        )
                        .addFields(
                            {
                                name:
                                    '🎮 Roblox Username',
                                value:
                                    application.robloxUsername
                            },
                            {
                                name:
                                    '🛡️ Previous Staff Experience',
                                value:
                                    application.experience
                            },
                            {
                                name:
                                    '❓ Why do you want to become staff?',
                                value:
                                    application.whyStaff
                            },
                            {
                                name:
                                    '⭐ Why should we choose you?',
                                value:
                                    application.whyYou
                            },
                            {
                                name:
                                    '⏰ Activity',
                                value:
                                    application.activity
                            }
                        )
                        .setColor(
                            0x57F287
                        )

                ],

                components: [

                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId(
                                    'close_staff_ticket'
                                )
                                .setLabel(
                                    'Close Ticket'
                                )
                                .setEmoji(
                                    '🔒'
                                )
                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        )

                ]

            });

            await applicant.send(

                '🎉 **Congratulations!**\n\n' +
                'Your **War Grounds staff application** has been accepted!\n\n' +
                'Your staff application ticket has been created in the server.'

            ).catch(
                () => {
                    console.log(
                        '⚠️ Could not DM the applicant.'
                    );
                }
            );

            return interaction.update({

                content:
                    `✅ **Application Accepted** by ${interaction.user}\n` +
                    `🎫 Ticket created: ${ticket}`,

                embeds:
                    interaction.message.embeds,

                components: []

            });

        } catch (error) {

            console.error(
                '❌ Application acceptance error:',
                error
            );

            if (
                !interaction.replied &&
                !interaction.deferred
            ) {

                return interaction.reply({
                    content:
                        '❌ Something went wrong while accepting this application.',
                    ephemeral: true
                });
            }
        }

        return;
    }

    /*
    ============================================================
    DECLINE APPLICATION
    ============================================================
    */

    if (type === 'decline') {

        try {

            application.status =
                'declined';

            application.reviewedAt =
                new Date();

            application.reviewedBy =
                interaction.user.id;

            await application.save();

            try {

                const applicant =
                    await interaction.client.users.fetch(
                        application.userId
                    );

                await applicant.send(

                    '📋 **War Grounds Staff Application**\n\n' +
                    'Thank you for applying to the War Grounds staff team.\n\n' +
                    'Unfortunately, your application has been **declined** at this time.\n\n' +
                    'You may apply again after the 48-hour cooldown.'

                );

            } catch (error) {

                console.log(
                    '⚠️ Could not DM the applicant.'
                );
            }

            return interaction.update({

                content:
                    `❌ **Application Declined** by ${interaction.user}`,

                embeds:
                    interaction.message.embeds,

                components: []

            });

        } catch (error) {

            console.error(
                '❌ Application decline error:',
                error
            );

            if (
                !interaction.replied &&
                !interaction.deferred
            ) {

                return interaction.reply({
                    content:
                        '❌ Something went wrong while declining this application.',
                    ephemeral: true
                });
            }
        }
    }

    };
