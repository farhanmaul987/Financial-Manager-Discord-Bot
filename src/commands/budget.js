import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { supabase } from "../database/db.js";
import config from "../../config.json" with { type: "json" };
const { color, image, app } = config;
import { logger } from "../utils/components/logger.js";
import { createErrorEmbed } from "../utils/embedLayout.js";
import { getCachedRPC } from "../utils/components/cache.js";
import { formatCurrency, parseAmount } from "../utils/components/formatter.js";
import { stripIndents } from "common-tags";

const getCategories = (userId) =>
  getCachedRPC("category", "get_all_category", userId);

export default {
    name: "budget",
    description: "Kelola budget.",
    options: [
        {
            name: "set",
            description: "Set budget kategori.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "limit_amount",
                    description: "Limit nominal budget.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "category",
                    description: "Pilih kategori.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                }
            ],
        },
    ],

    autocomplete: async (_, interaction) => {
        const focusedOption = interaction.options.getFocused(true);
        const query = focusedOption.value?.toLowerCase() || "";
        const userId = interaction.user.id;

        switch (focusedOption.name) {
            case "category": {
                const categories = await getCategories(userId);

                const filtered = categories
                    .filter(
                        (c) =>
              c.name.toLowerCase().includes(query) ||
              c.id_category.toLowerCase().includes(query) ||
              (c.icon ?? "").toLowerCase().includes(query)
          )
          .slice(0, 25)
          .map((c) => ({
            name: `${c.icon ?? ""} ${c.name}`,
            value: c.id_category,
          }));

        return interaction.respond(filtered);
      }

      default:
        return interaction.respond([]);
    }
  },

  callback: async (client, interaction) => {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
        case "set": {
            await interaction.deferReply();
        }
    }
  }
}