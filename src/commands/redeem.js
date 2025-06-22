const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/boostData.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('redeem')
    .setDescription('Redeem your booster-only perks.'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    let boostData = {};
    try {
      const raw = fs.readFileSync(dataPath, 'utf8');
      boostData = raw ? JSON.parse(raw) : {};
    } catch {
      boostData = {};
    }

    if (!boostData[guildId]?.boosters?.includes(userId)) {
      return interaction.reply({
        content: '❌ You need to be a booster to redeem perks!',
        ephemeral: true
      });
    }

    if (!boostData[guildId].redeemed) {
      boostData[guildId].redeemed = [];
    }

    if (boostData[guildId].redeemed.includes(userId)) {
      return interaction.reply({
        content: '⚠️ You’ve already redeemed your perks.',
        ephemeral: true
      });
    }

    boostData[guildId].redeemed.push(userId);

    try {
      fs.writeFileSync(dataPath, JSON.stringify(boostData, null, 2));
    } catch {
      return interaction.reply({ content: '❌ Failed to save your redemption. Try again.', ephemeral: true });
    }

    // You can customize this reward (e.g., role, item, etc.)
    return interaction.reply({
      content: '✅ You’ve redeemed your booster perks. Thank you for the support!',
      ephemeral: true
    });
  }
};
