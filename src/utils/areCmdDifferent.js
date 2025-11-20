import path from "path";
import getAllFiles from "./getAllFiles.js";

const areCmdDifferent = async (exceptions = []) => {
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

export default areCmdDifferent;