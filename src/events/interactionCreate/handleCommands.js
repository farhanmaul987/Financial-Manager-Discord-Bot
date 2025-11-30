import { readFileSync } from 'fs';
const config = JSON.parse(readFileSync('./config.json', 'utf8'));
const { mainServer, devs } = config;
import { logger } from '../../utils/logger.js';

import getLocalCommands from "../../utils/getLocalCommands.js";

const handleCommands = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = await getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    logger.command(interaction);

    if (commandObject.devOnly) {
      if (!devs.includes(interaction.member.id)) {
        interaction.reply({
          content: "⛔  You do not have permission to use this command.",
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (!(interaction.guild.id === mainServer)) {
        interaction.reply({
          content: "⛔  This command cannot be ran here.",
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: "⛔  You do not have permission to use this command.",
            ephemeral: true,
          });
          return;
        }
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;

        if (!bot.permissions.has(permission)) {
          interaction.reply({
            content: "⛔  I do not have permission to use this command.",
            ephemeral: true,
          });
          return;
        }
      }
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    logger.red("ERROR", `handleCommands: ${error}.`);
  }
};

export default handleCommands;