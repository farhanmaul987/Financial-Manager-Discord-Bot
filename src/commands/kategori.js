import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { supabase } from "../database/db.js";
import { color, image } from "../utils/property.js";
import { logger } from "../utils/logger.js";
import { createErrorEmbed } from "../utils/embedLayout.js";
import { cache } from "../utils/cache.js";

export default {
  name: "kategori",
  description: "Kelola kategori.",
  options: [
    {
      name: "add",
      description: "Tambah kategori baru.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Nama kategori.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "icon",
          description: "Gunakan default icon.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],

  callback: async (client, interaction) => {
    const sub = interaction.options.getSubcommand();

    if (sub === "add") {
      await interaction.deferReply();

      const name = interaction.options.getString("name");
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      const icon = interaction.options.getString("icon") || "📁";
      const userId = interaction.user.id;

      const { data, error } = await supabase.rpc("add_category", {
        p_id_user: userId,
        p_name: capitalized,
        p_icon: icon,
      });

      if (error) {
        logger.red("ERROR", `Supabase error: ${error.message}`);

        const errorEmbed = createErrorEmbed(
          "Kategori Gagal Ditambahkan",
          error.message
        );

        return interaction.editReply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }
      const row = data?.[0];

      if (!row) {
        const emptyEmbed = createErrorEmbed(
          "Tidak Ada Data dari Database",
          "Function add_category tidak mengembalikan result."
        );
        return interaction.editReply({ embeds: [emptyEmbed] });
      }

      const embed = new EmbedBuilder()
        .setColor(color.purple)
        .setTitle("Kategori Ditambahkan")
        .setThumbnail(image.logo)
        .addFields(
          { name: "ID", value: row.id_category, inline: true },
          { name: "Nama", value: row.name, inline: true },
          { name: "Icon", value: row.icon, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: "PiggyBank", iconURL: image.logo });

      cache.category.data = null;
      cache.category.last = 0;

      return interaction.editReply({ embeds: [embed] });
    }
  },
};
