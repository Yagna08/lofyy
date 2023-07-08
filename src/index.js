const { Client, IntentsBitField } = require('discord.js');

const dotenv = require('dotenv')
dotenv.config()

const client = new Client({ 
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

client.on('ready', (c) => {
    console.log(c.guilds);
    console.log(`Logged in as ${c.user.tag}!`);
});

client.on("messageCreate", function (msg) { 
    console.log(msg.content);
    // if (msg.author.bot) {
    //     return;
    // }

    if (msg.content === "ping") {
        msg.reply("pong!");
        console.log("pong-ed " + msg.author.username);
}
});

client.login(process.env.TOKEN);




