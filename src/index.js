const { Client, IntentsBitField, ActivityType, VoiceConnectionStatus, entersState } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('./ytSearch')
const regex = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
const musicQueues = new Map();


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

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log(interaction.commandName)

    if (interaction.commandName === 'play') {
        let song = interaction.options.get('link').value;
        const match = song.match(regex);

        if (match && match[0] === "youtube") {
            console.log('Youtube Link provided!')
        } else {
            console.log('Query provided')
            song = await ytSearch(song)
        }

        let guildQueue = musicQueues.get(interaction.guild.id);

        let connection = joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        // If there's no song playing, play the song and create a new queue
        if (!guildQueue) {
            let player = createAudioPlayer();
            player.on('idle', () => {
                let guildQueue = musicQueues.get(interaction.guild.id);
                if (guildQueue) {
                    guildQueue.shift();
                    if (guildQueue.length > 0) {
                        let nextSong = guildQueue[0]['song'];
                        let stream = ytdl(nextSong, { filter: 'audioonly', quality: 'highestaudio' });
                        let resource = createAudioResource(stream);
                        player.play(resource);
                        nextSong.interaction.followUp('Now playing the next song in the queue.');
                    } else {
                        connection.destroy();
                    }
                }
            });
            let stream = ytdl(song, { filter: 'audioonly', quality: 'highestaudio' });
            let resource = createAudioResource(stream);
            let queue = [{
                interaction: interaction,
                song: song,
                connection: connection,
            }];

            musicQueues.set(interaction.guild.id, queue);
            player.play(resource);
            connection.subscribe(player);
            interaction.reply('Now playing your song: ' + song);
        } else {
            // If a song is already playing, add the new song to the queue
            guildQueue.push({
                song: song,
                interaction: interaction,
                connection: connection,
            });
            interaction.reply('Your song has been added to the queue.');
        }
    }

    if (interaction.commandName === 'skip') {
        let guildQueue = musicQueues.get(interaction.guild.id);

        if (!guildQueue || guildQueue.length === 0) {
            interaction.reply('There are no songs in the queue to skip.');
        } else {
            // End the current song
            let currentSong = guildQueue.shift();
            console.log("Skipping to" + currentSong)
            currentSong.connection.destroy();

            // If there's another song in the queue, start playing it
            if (guildQueue.length > 0) {
                let player = createAudioPlayer();
                let nextSong = guildQueue[0]['song'];
                let stream = ytdl(nextSong, { filter: 'audioonly', quality: 'highestaudio' });
                let resource = createAudioResource(stream);
                player.play(resource);
                currentSong.connection.subscribe(player);
                nextSong.interaction.followUp('Now playing the next song in the queue.');
            }
        }
    }


    if (interaction.commandName === 'search') {
        const query = interaction.options.get('query').value;
        const url = await ytSearch(query)
        interaction.reply(JSON.stringify(url));
    }

    if (interaction.commandName === 'leave') {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('You are not in a voice channel.');
        }

        voiceChannel.leave();
        interaction.reply("Left the voice channel");
    }

    if (interaction.commandName === 'ping') {
        interaction.reply("pong!");
    }
});

client.login(process.env.TOKEN);
