import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { supabase } from "../database/db.js";
import { color, image } from "../utils/components/property.js";
import { logger } from "../utils/components/logger.js";
import { createErrorEmbed } from "../utils/embedLayout.js";
import { getCachedRPC } from "../utils/components/cache.js";
import { formatCurrency } from "../utils/components/currency.js";
import { stripIndents } from "common-tags";

const getWallets = (userId) => getCachedRPC("wallet", "get_all_wallet", userId);
const getCategories = (userId) =>
  getCachedRPC("category", "get_all_category", userId);

export default {
  name: "transaksi",
  description: "Kelola transaksi.",
  options: [
    {
      name: "add",
      description: "Tambah transaksi baru.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "wallet",
          description: "Pilih wallet.",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
        {
          name: "category",
          description: "Pilih kategori.",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
        {
          name: "amount",
          description: "Nominal transaksi.",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
        {
          name: "type",
          description: "Jenis transaksi.",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "Income", value: "income" },
            { name: "Expense", value: "expense" },
          ],
        },
        {
          name: "note",
          description: "Catatan tambahan.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
  ],

  autocomplete: async (_, interaction) => {
    const focused = interaction.options.getFocused(true);
    const query = focused.value?.toLowerCase() || "";
    const userId = interaction.user.id;

    switch (focused.name) {
      case "wallet": {
        const wallets = await getWallets(userId);

        const filtered = wallets
          .filter(
            (w) =>
              w.name.toLowerCase().includes(query) ||
              w.id_wallet.toLowerCase().includes(query)
          )
          .slice(0, 25)
          .map((w) => ({
            name: w.name,
            value: w.id_wallet,
          }));

        return interaction.respond(filtered);
      }

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
      case "add": {
        await interaction.deferReply();

        const walletId = interaction.options.getString("wallet");
        const categoryId = interaction.options.getString("category");
        const amount = interaction.options.getNumber("amount");
        const type = interaction.options.getString("type");
        const note = interaction.options.getString("note") || "-";
        const userId = interaction.user.id;

        const wallets = await getWallets(userId);
        const categories = await getCategories(userId);

        const wallet = wallets.find((w) => w.id_wallet === walletId);
        const category = categories.find((c) => c.id_category === categoryId);

        if (type === "expense" && !wallet.is_spendable) {
          logger.red("ERROR", "Wallet not spendable");

          const errorEmbed = createErrorEmbed(
            "Transaksi Ditolak",
            `Wallet ${wallet.name.toUpperCase()} tidak boleh dipakai untuk pengeluaran`
          );

          return interaction.editReply({
            embeds: [errorEmbed],
            flags: MessageFlags.Ephemeral,
          });
        }

        const balance = Number(wallet.amount);

        if (type === "expense" && amount > balance) {
          logger.red(
            "ERROR",
            `Insufficient balance ${wallet.name}: ${formatCurrency(balance)}`
          );

          const errorEmbed = createErrorEmbed(
            "Saldo Tidak Cukup",
            `Sisa saldo ${wallet.name.toUpperCase()}: ${formatCurrency(
              balance
            )}`
          );

          return interaction.editReply({
            embeds: [errorEmbed],
            flags: MessageFlags.Ephemeral,
          });
        }

        const { data, error } = await supabase.rpc("add_transaction", {
          p_id_user: userId,
          p_id_wallet: walletId,
          p_id_category: categoryId,
          p_amount: amount,
          p_type: type,
          p_note: note,
        });

        if (error) {
          logger.red("ERROR", `Error adding transaction: ${error.message}`);

          const errorEmbed = createErrorEmbed(
            "Transaksi Gagal Ditambahkan",
            error.message
          );

          return interaction.editReply({
            embeds: [errorEmbed],
            flags: MessageFlags.Ephemeral,
          });
        }

        const trx = data?.[0];
        const avatarURL = interaction.user.avatarURL({ size: 64 });

        const formattedAmount = formatCurrency(amount);

        const embed = new EmbedBuilder()
          .setColor(type === "income" ? color.blue : color.purple)
          .setTitle("Transaksi Ditambahkan")
          .setDescription(stripIndents`\*\*💰 Amount:\*\* ${formattedAmount}`)
          .setThumbnail(image.logo)
          .addFields(
            { name: "👛 Wallet", value: wallet?.name ?? "-", inline: true },
            {
              name: "🏷️ Category",
              value: `${category?.icon ?? ""} ${category?.name ?? "-"}`,
              inline: true,
            },
            { name: "🔁 Type", value: type, inline: false },
            {
              name: "🧾 ID Invoice",
              value: stripIndents`\`${trx?.id_transaction}\`` ?? stripIndents`\`-\``,
              inline: true,
            },
            { name: "📝 Note", value: note || "-", inline: false }
          )

          .setTimestamp()
          .setFooter({ text: interaction.user.username, iconURL: avatarURL });

        return interaction.editReply({ embeds: [embed] });
      }
    }
  },
};
