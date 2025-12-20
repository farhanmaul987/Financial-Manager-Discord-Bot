import { EmbedBuilder } from "discord.js";
import config from "../../config.json" with { type: "json" };
const { color, image, app } = config;
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
    .setFooter({ text: app.botName, iconURL: image.logo });
};
