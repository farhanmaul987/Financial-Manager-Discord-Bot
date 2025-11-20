import { fileURLToPath } from "url";
import path from "path";
import getAllFiles from "../utils/getAllFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventHandler = (client) => {
  const eventFolders = getAllFiles(
    path.join(process.cwd(), "src", "events"),
    true
  );

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);

    eventFiles.sort((a, b) => a > b);

    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

    client.on(eventName, async (arg) => {
      for (const eventFile of eventFiles) {
        const eventFunction = (await import(eventFile)).default;
        await eventFunction(client, arg);
      }
    });
  }
};

export default eventHandler;