const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/guildConfigs.json');
const dataPath = path.join(__dirname, '../data/boostData.json');

function loadConfig(guildId) {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const data = JSON.parse(raw);
    return data[guildId];
  } catch {
    return null;
  }
}

function loadBoostData() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveBoostData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = async (oldMember, newMember) => {
  if (oldMember.premiumSince === newMember.premiumSince) return;

  const config = loadConfig(newMember.guild.id);
  if (!config) return;

  const { boosterRoleId, announceChannelId, logChannelId, boostListChannelId } = config;
  const role = newMember.guild.roles.cache.get(boosterRoleId);
  const logChannel = await newMember.guild.channels.fetch(logChannelId).catch(() => null);
  const announceChannel = await newMember.guild.channels.fetch(announceChannelId).catch(() => null);
  const listChannel = await newMember.guild.channels.fetch(boostListChannelId).catch(() => null);

  const isBoosting = !!newMember.premiumSince;
  const boostData = loadBoostData();

  if (!boostData[newMember.guild.id]) {
    boostData[newMember.guild.id] = {
      boosters: [],
      messageId: null
    };
  }

  const guildBoosters = boostData[newMember.guild.id].boosters;

  if (isBoosting) {
    if (!guildBoosters.includes(newMember.id)) {
      guildBoosters.push(newMember.id);
    }

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
      await newMember.send(`Thanks for boosting **${newMember.guild.name}**! 💜 You now have access to booster perks.`);
    } catch {}
  } else {
    const index = guildBoosters.indexOf(newMember.id);
    if (index > -1) guildBoosters.splice(index, 1);

    if (role) await newMember.roles.remove(role).catch(() => {});
    if (logChannel) logChannel.send(`⚠️ ${newMember.user.tag} has stopped boosting.`);
  }

  // Save updated boost data
  saveBoostData(boostData);

  // Update the list channel message
  if (listChannel) {
    const boostList = guildBoosters.map((id, i) => {
      const member = newMember.guild.members.cache.get(id);
      return `${i + 1}. ${member?.user.tag ?? `Unknown (${id})`}`;
    }).join('\n') || 'No current boosters.';

    const content = `**✨ Current Server Boosters:**\n${boostList}`;

    let msg;
    if (boostData[newMember.guild.id].messageId) {
      msg = await listChannel.messages.fetch(boostData[newMember.guild.id].messageId).catch(() => null);
    }

    if (msg) {
      await msg.edit({ content });
    } else {
      msg = await listChannel.send({ content });
      boostData[newMember.guild.id].messageId = msg.id;
      saveBoostData(boostData);
    }
  }
};
