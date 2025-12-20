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
import { cache } from "../utils/components/cache.js";
import { formatCurrency, parseAmount } from "../utils/components/formatter.js";
import { stripIndents } from "common-tags";

export default {
  name: "wallet",
  description: "Kelola wallet.",
  options: [
    {
      name: "add",
      description: "Tambah wallet baru.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Nama wallet.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "amount",
          description: "Nominal awal wallet.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "is_spendable",
          description: "Apakah wallet ini bisa dipakai transaksi?",
          type: ApplicationCommandOptionType.Boolean,
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
      const amountRaw = interaction.options.getString("amount");
      const isSpendable = interaction.options.getBoolean("is_spendable");
      const userId = interaction.user.id;

      const amountResult = parseAmount(amountRaw);

      if (!amountResult.success) {
        return interaction.editReply({
          embeds: [amountResult.embed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const amount = amountResult.amount;

      const { data, error } = await supabase.rpc("add_wallet", {
        p_id_user: userId,
        p_name: name,
        p_amount: amount || 0,
        p_is_spendable: isSpendable,
      });

      if (error) {
        logger.red("ERROR", `Supabase error: ${error.message}`);

        const errorEmbed = createErrorEmbed(
          "Wallet Gagal Ditambahkan",
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
          "Function add_wallet tidak mengembalikan result."
        );
        return interaction.editReply({ embeds: [emptyEmbed] });
      }

      const balance = Number(row.amount);

      const embed = new EmbedBuilder()
        .setColor(color.purple)
        .setTitle("Wallet Ditambahkan")
        .setDescription(
          stripIndents`\*\*💰 Amount:\*\* ${formatCurrency(balance)}`
        )
        .setThumbnail(image.logo)
        .addFields(
          { name: "👤 Name", value: row.name, inline: true },
          {
            name: row.is_spendable ? "🔓 Spendable" : "🔒 Spendable",
            value: row.is_spendable ? "Yes" : "No",
            inline: true,
          },
          {
            name: "🆔 ID",
            value: stripIndents`\`${row.id_wallet}\``,
            inline: false,
          }
        )
        .setTimestamp()
        .setFooter({ text: app.botName, iconURL: image.logo });

      cache.wallet.data = null;
      cache.wallet.last = 0;
      return interaction.editReply({ embeds: [embed] });
    }
  },
};
