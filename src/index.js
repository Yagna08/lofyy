const { Client, IntentsBitField, ActivityType } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    StreamType,
    AudioPlayerStatus
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const dotenv = require('dotenv')
dotenv.config()

const client = new Client({ 
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates
    ]
});

client.on('ready', (c) => {
    console.log(`Logged in as ${c.user.tag}!`);
    c.user.setActivity({
        name: 'To play',
        type: ActivityType.Playing,
    });
});

client.on("messageCreate", function (msg) { 
    console.log(msg.content);
    
    

    if (msg.content === "ping") {
        msg.reply("pong!");
        console.log("pong-ed " + msg.author.username);
}
});


async function playAudioFromYouTube(interaction, url, player) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
        return interaction.reply('Join a channel and try again');
    }

    const stream = ytdl(url, { filter: 'audioonly',quality:'highestaudio' });

    const resource = createAudioResource(stream);

    player.play(resource);

    channel = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    channel.subscribe(player);

    return interaction.reply(`Playing ${url}`);
};


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log(interaction.commandName)

    if (interaction.commandName === 'p') {
        const link = interaction.options.get('link').value;

        // interaction.reply(`The link is ${num1}`);

        if (interaction.member.voice.channel) {
            let channel = null;
            const player = createAudioPlayer();

            player.on(AudioPlayerStatus.Idle, () => {
                if (channel) {
                    channel.leave();
                    channel = null;
                }
            });

            player.on('error', error => {
                console.error(`Error: ${error.message} with resource ${error.resource.metadata.url}`);
            });

            await playAudioFromYouTube(interaction, link, player)
        } else {
            interaction.reply('Join a voice channel then try again!');
        }
    }
        
    if (interaction.commandName === 'ping') {
        interaction.reply("pong!");
    }

})


client.login(process.env.TOKEN);




