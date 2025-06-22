const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/boostData.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('boostleaderboard')
    .setDescription('View a leaderboard of current boosters.'),

  async execute(interaction) {
    let boostData = {};
    try {
      const raw = fs.readFileSync(dataPath, 'utf8');
      boostData = raw ? JSON.parse(raw) : {};
    } catch {
      boostData = {};
    }

    const boosters = boostData[interaction.guildId]?.boosters || [];

    if (boosters.length === 0) {
      return interaction.reply({
        content: 'No boosters currently boosting this server.',
        ephemeral: true
      });
    }

    const display = boosters.map((id, i) => {
      const member = interaction.guild.members.cache.get(id);
      return `${i + 1}. ${member?.user.tag || `Unknown (${id})`}`;
    }).join('\n');

    return interaction.reply({
      content: `🏆 **Server Boost Leaderboard:**\n${display}`,
      ephemeral: false
    });
  }
};
