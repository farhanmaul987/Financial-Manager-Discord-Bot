import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  MessageFlags,
} from "discord.js";
import { supabase } from "../database/db.js";
import { stripIndents } from "common-tags";

export default {
  name: "tambahkategori",
  description: "Tambah kategori baru.",
  options: [
    {
      name: "name",
      description: "Nama Kategori yang ingin ditambahkan",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "type",
      description: "Jenis kategori.",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "🟩 Income", value: "income" },
        { name: "🟥 Expense", value: "expense" },
      ],
    },
    {
      name: "icon",
      description: "Gunakan default emoji.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  // deleted: true,

  callback: async (client, interaction) => {
    const name = interaction.options.getString("name");
    const type = interaction.options.getString("type");
    const icon = interaction.options.getString("icon") || null;

    await interaction.deferReply({});

    // 🚀 panggil stored procedure Supabase
    const { data, error } = await supabase.rpc("add_category", {
      p_name: name,
      p_type: type,
      p_icon: icon,
    });

    if (error) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("FAILED TO ADD CATEGORY")
            .setColor("Red")
            .setDescription(stripIndents`
              Error:
              \`\`\`${error.message}\`\`\`
              `),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("CATEGORY ADDED")
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/1049244601057292360/1444692589981732984/logo.png?ex=692da252&is=692c50d2&hm=2614828fa219a460ad3f450c6f69d6b1613772e2cf2043ce278f3b7edc84d8ba&"
      )
      .setColor(type === "income" ? "Green" : "Orange")
      .addFields(
        // { name: "\u200b", value: "\u200b", inline: true }, // field kosong sebagai spacing
        { name: "📝 Nama", value: name, inline: true },
        { name: "📌 Tipe", value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
        { name: "🖼️ Icon", value: icon ?? "—", inline: true },
        { name: "🪪 ID", value: data ?? "—" },
      )
      .setTimestamp()
      .setFooter({ text: 'PiggyBank', iconURL: 'https://cdn.discordapp.com/attachments/1049244601057292360/1444692589981732984/logo.png?ex=692da252&is=692c50d2&hm=2614828fa219a460ad3f450c6f69d6b1613772e2cf2043ce278f3b7edc84d8ba&'});

    interaction.editReply({ embeds: [embed] });
  },
};
