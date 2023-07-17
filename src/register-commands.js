require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'play',
        description: 'Plays the query or youtube link that you provide',
        options: [
            {
                name: 'link',
                description: 'Paste Your Link Here',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    {
        name: 'search',
        description: 'searches for the query that you provide',
        options: [
            {
                name: 'search',
                description: 'Write your query here',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    {
        name: 'leave',
        description: 'Leaves the channel',
        options: [
        ],
    },
    {
        name: 'skip',
        description: 'Skips the channel',
        options: [
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log('Slash commands were registered successfully!');
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();