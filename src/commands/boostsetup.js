const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

const configPath = path.join(__dirname, '../data/guildConfigs.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('boostsetup')
    .setDescription('Set up BoostBuddy Pro for this server.')
    .addRoleOption(option =>
      option.setName('boosterrole')
        .setDescription('Role to assign when a user boosts')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('announcechannel')
        .setDescription('Channel to send custom boost embed')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('logchannel')
        .setDescription('Channel for logging boosts')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)),

  async execute(interaction) {
    const boosterRole = interaction.options.getRole('boosterrole');
    const announceChannel = interaction.options.getChannel('announcechannel');
    const logChannel = interaction.options.getChannel('logchannel');

    let configs = {};
    try {
      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf8');
        configs = data ? JSON.parse(data) : {};
      }
    } catch (err) {
      console.error("Failed to read config:", err);
    }

    configs[interaction.guildId] = {
      boosterRoleId: boosterRole.id,
      announceChannelId: announceChannel.id,
      logChannelId: logChannel.id
    };

    fs.writeFileSync(configPath, JSON.stringify(configs, null, 2));
    return interaction.reply({ content: '✅ BoostBuddy Pro has been set up successfully!', ephemeral: true });
  }
};
