require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Partials,
    SlashCommandBuilder
} = require('discord.js');

const connectDatabase = require('./database/mongodb');

const {
    showApplicationModal,
    showGeneralSupportModal,
    showBugReportModal,
    showPlayerReportModal,
    showOtherModal,
    showContentCreatorApplicationModal,
} = require('./handlers/applicationHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],

    partials: [
        Partials.Channel
    ]
});

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('applications')
            .setDescription('Manage War Grounds staff applications'),

        new SlashCommandBuilder()
            .setName('warn')
            .setDescription('Warn a member')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('The member to warn')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('Reason for the warning')
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName('removewarn')
            .setDescription('Remove a warning from a member')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('The member to remove a warning from')
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName('contentcreator')
            .setDescription(
                'Apply to become a War Grounds Content Creator'
            ),
        new SlashCommandBuilder()
            .setName('say')
            .setDescription('Make the bot send a message')
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('The message to send')
                    .setRequired(true)
            ),

    ];

    for (const guild of client.guilds.cache.values()) {

        try {

            await guild.commands.set(
                commands.map(command =>
                    command.toJSON()
                )
            );

            console.log(
                `✅ Registered commands in ${guild.name}`
            );

        } catch (error) {

            console.error(
                `❌ Failed to register commands in ${guild.name}:`,
                error.message
            );
        }
    }
});

const interactionCreate =
    require('./events/interactionCreate');

client.on(
    'interactionCreate',
    interactionCreate
);

const messageCreate =
    require('./events/messageCreate');

client.on(
    'messageCreate',
    messageCreate
);

async function startBot() {

    await connectDatabase();

    await client.login(
        process.env.DISCORD_TOKEN
    );
}

startBot();