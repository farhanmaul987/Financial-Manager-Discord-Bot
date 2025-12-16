import { MessageFlags, EmbedBuilder } from "discord.js";
import { color, image } from "../utils/components/property.js";

export default {
  name: "ping",
  description: "Get the bot's latency",

  callback: (client, interaction) => {
    const embed = new EmbedBuilder()
      .setColor(color.red)
      .setTitle("Pong!")
      .setThumbnail(image.logo)
      .addFields({ name: "Latency", value: `${client.ws.ping}ms` })
      .setTimestamp()
      .setFooter({ text: "PiggyBank", iconURL: image.logo });

    interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
