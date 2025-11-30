import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import areCommandsDifferent from "../../utils/areCmdDifferent.js";
import getApplicationCommands from "../../utils/getAppCommands.js";
import getLocalCommands from "../../utils/getLocalCommands.js";
import { logger } from "../../utils/logger.js";
import clc from "cli-color";

// Path for config.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(process.cwd(), "config.json");

const { mainServer } = JSON.parse(readFileSync(configPath, "utf8"));

export default async (client) => {
  try {
    logger.blue("INFO", "Syncing commands...");

    const localCommands = await getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      mainServer
    );

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      // Cek apakah command lokal sudah ada di Discord
      const existingCommand = applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );

      if (existingCommand) {
        // If flagged as deleted
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          logger.red("DELETE", `Command: "${name}"`);
          continue;
        }

        // If there are differences → edit
        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          logger.yellow("UPDATE", `Command: ${clc.magentaBright(name)}`);
        }
      } else {
        // Create new command
        if (localCommand.deleted) {
          logger.yellow("SKIP", `Command: "${name}" is flagged as deleted.`);
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });

        logger.green("CREATE", `Command: "${name}"`);
      }
    }

    for (const existing of applicationCommands.cache.values()) {
      const found = localCommands.find((cmd) => cmd.name === existing.name);

      if (!found) {
        await applicationCommands.delete(existing.id);
        logger.red("DELETE", `Command: "${existing.name}" (no longer exists locally).`);
      }
    }

    logger.green("DONE", "All commands are synced!");
  } catch (error) {
    logger.red("ERROR", `02registCmd: ${error}`);
  }
};
