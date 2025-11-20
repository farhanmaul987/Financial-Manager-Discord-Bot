import { MessageFlags } from "discord.js";

module.exports = {
  name: "ping",
  description: "Get the bot's latency",

  callback: (client, interaction) => {
    interaction.reply({
      content: `Ping! ${client.ws.ping}ms`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
