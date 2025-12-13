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

function formatCurrency(number) {
  const roundedNumber = Math.round(number * 100) / 100;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundedNumber);
}

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
          type: ApplicationCommandOptionType.Number,
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
      const amount = interaction.options.getNumber("amount");
      const isSpendable = interaction.options.getBoolean("is_spendable");
      const userId = interaction.user.id;

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
        .setThumbnail(image.logo)
        .addFields(
          { name: "ID", value: row.id_wallet, inline: true },
          { name: "Name", value: row.name, inline: true },
          { name: "Amount", value: formatCurrency(balance), inline: true },
          {
            name: "Spendable",
            value: row.is_spendable ? "Yes" : "No",
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({ text: "PiggyBank", iconURL: image.logo });

      cache.wallet.data = null;
      cache.wallet.last = 0;
      return interaction.editReply({ embeds: [embed] });
    }
  },
};
