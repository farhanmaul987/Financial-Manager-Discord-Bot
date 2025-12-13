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
  // Membulatkan ke 2 desimal terdekat sebelum memformat
  const roundedNumber = Math.round(number * 100) / 100;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundedNumber);
}

// Generic fetcher with caching
async function getCachedRPC(key, rpcName, ttl = 5000) {
  const now = Date.now();

  // Force refresh jika data kosong atau cache expired
  const shouldRefresh =
    !cache[key].data ||
    cache[key].data.length === 0 ||
    now - cache[key].last >= ttl;

  if (!shouldRefresh) {
    return cache[key].data;
  }

  // Fetch fresh
  const { data, error } = await supabase.rpc(rpcName);

  if (error) {
    console.error(`Error on RPC ${rpcName}:`, error);
    return cache[key].data ?? []; // fallback
  }

  cache[key].data = data || [];
  cache[key].last = now;

  return cache[key].data;
}

const getWallets = () => getCachedRPC("wallet", "get_all_wallet");
const getCategories = () => getCachedRPC("category", "get_all_category");

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

    switch (focused.name) {
      case "wallet": {
        const wallets = await getWallets();

        // FILTER wallet berdasarkan input user
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
        const categories = await getCategories();

        // FILTER kategori berdasarkan input user
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

        // Ambil data wallet & category dari cache untuk keperluan display nama/icon
        const wallets = await getWallets();
        const categories = await getCategories();

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
          .setThumbnail(image.logo)
          .addFields(
            { name: "Wallet", value: wallet?.name ?? "-", inline: true },
            {
              name: "Category",
              value: `${category?.icon ?? ""} ${category?.name ?? "-"}`,
              inline: true,
            },
            { name: "Amount", value: formattedAmount, inline: true },
            { name: "Type", value: type, inline: true },
            {
              name: "ID Invoice",
              value: trx?.id_transaction ?? "-",
              inline: true,
            },
            { name: "Note", value: note, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: interaction.user.username, iconURL: avatarURL });

        return interaction.editReply({ embeds: [embed] });
      }
    }
  },
};
