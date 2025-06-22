const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/guildConfigs.json');

function getConfig(guildId) {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const data = JSON.parse(raw);
    return data[guildId];
  } catch {
    return null;
  }
}

module.exports = async (oldMember, newMember) => {
  if (oldMember.premiumSince === newMember.premiumSince) return;

  const config = getConfig(newMember.guild.id);
  if (!config) return;

  const { boosterRoleId, announceChannelId, logChannelId } = config;

  const isBoosting = !!newMember.premiumSince;
  const logChannel = await newMember.guild.channels.fetch(logChannelId).catch(() => null);
  const announceChannel = await newMember.guild.channels.fetch(announceChannelId).catch(() => null);
  const role = newMember.guild.roles.cache.get(boosterRoleId);

  if (isBoosting) {
    if (role) await newMember.roles.add(role).catch(() => {});
    if (announceChannel) {
      announceChannel.send({
        embeds: [
          {
            title: "🚀 New Boost!",
            description: `**${newMember.user.tag}** just boosted the server!`,
            color: 0xFF73FA,
            footer: { text: 'Thank you for supporting us 💖' }
          }
        ]
      });
    }
    if (logChannel) logChannel.send(`🔔 ${newMember.user.tag} boosted the server.`);
    try {
      await newMember.send(`Thanks for boosting **${newMember.guild.name}**! 💜 You now have access to your booster perks.`);
    } catch {}
  } else {
    if (role) await newMember.roles.remove(role).catch(() => {});
    if (logChannel) logChannel.send(`⚠️ ${newMember.user.tag} has stopped boosting.`);
  }
};
