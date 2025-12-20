import { MessageFlags, EmbedBuilder } from "discord.js";
import config from "../../config.json" with { type: "json" };
const { color, image, app } = config;

export default {
  name: "ping",
  description: "Get the bot's latency",

  callback: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setColor(color.red)
      .setTitle("Pong!".toUpperCase())
      .setThumbnail(image.logo)
      .addFields({ name: "Latency", value: `${client.ws.ping}ms` })
      .setTimestamp()
      .setFooter({ text: app.botName, iconURL: image.logo });

    interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    const channel = await client.channels.fetch("1444835085902680135");
    if (channel) {
      channel.send({ embeds: [embed] });
    }
  },
};
