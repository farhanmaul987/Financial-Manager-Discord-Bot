import { EmbedBuilder, MessageFlags } from "discord.js";
import { color, image } from "../utils/components/property.js";

export default {
    name: "sample",
    description: "Sample command.",
    callback: (client, interaction) => {
        const avatarUrl = interaction.user.avatarURL({ size: 64 });
        const sampleEmbed = new EmbedBuilder()
          .setColor(color.red)
          .setTitle("Embed Sample")
          .setURL("https://google.com")
          .setAuthor({
            name: "PiggyBank",
            iconURL: image.logo,
            url: "https://www.farhanmaul.my.id/",
          })
          .setDescription(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt"
          )
          .setThumbnail(image.logo)
          .addFields(
            { name: "Regular field title", value: "Some value here" },
            { name: "\u200B", value: "\u200B" },
            {
              name: "Inline field title",
              value: "Some value here",
              inline: true,
            },
            {
              name: "Inline field title",
              value: "Some value here",
              inline: true,
            }
          )
          .addFields({
            name: "Inline field title",
            value: "Some value here",
            inline: true,
          })
          .setImage(image.logo)
          .setTimestamp()
          .setFooter({ text: interaction.user.username, iconURL: avatarUrl });

        interaction.reply({ embeds: [sampleEmbed], flags: MessageFlags.Ephemeral });
    }
}