import "dotenv/config";
// Import Class Client dan IntentsBitField dari library
import { Client, IntentsBitField } from "discord.js";
import eventHandler from "./handlers/eventHandler.js";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// eventHandler function
eventHandler(client);

client.login(process.env.TOKEN);