import { EmbedBuilder } from "discord.js";
import { color, image } from "./components/property.js";
import { stripIndents } from "common-tags";

export const createErrorEmbed = (title, errorMessage) => {
  return new EmbedBuilder()
    .setColor(color.red)
    .setTitle(title)
    .setDescription(
      stripIndents`
      \`\`\`${errorMessage}\`\`\`
      `
    )
    .setTimestamp()
    .setFooter({ text: "PiggyBank", iconURL: image.logo });
};
