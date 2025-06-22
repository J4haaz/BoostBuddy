require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

// Register all commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Command handler
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
  }
});

// Boost handler
const boostHandler = require('./handlers/boostHandler');
client.on(Events.GuildMemberUpdate, boostHandler);

client.once(Events.ClientReady, () => {
  console.log(`✅ BoostBuddy Pro is online as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
