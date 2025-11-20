import path from "path";
import { fileURLToPath } from "url";
import getAllFiles from "./getAllFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getLocalCommands = async (exceptions = []) => {
  let localCommands = [];
  const commandsDir = path.join(process.cwd(), "src", "commands");
  const commandFiles = getAllFiles(commandsDir);

  for (const commandFile of commandFiles) {
    const commandModule = await import(commandFile);
    const commandObject = commandModule.default || commandModule;

    if (exceptions.includes(commandObject.name)) {
      continue;
    }
    localCommands.push(commandObject);
  }

  return localCommands;
};

export default getLocalCommands;
