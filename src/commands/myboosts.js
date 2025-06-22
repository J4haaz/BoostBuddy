const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/boostData.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('myboosts')
    .setDescription('Check your boost status on this server.'),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    let boostData = {};
    try {
      const raw = fs.readFileSync(dataPath, 'utf8');
      boostData = raw ? JSON.parse(raw) : {};
    } catch {
      boostData = {};
    }

    const isBoosting = boostData[guildId]?.boosters?.includes(userId);

    return interaction.reply({
      content: isBoosting
        ? `🚀 You're currently boosting this server. Thank you! 💜`
        : `❌ You're not currently boosting this server.`,
      ephemeral: true
    });
  }
};
