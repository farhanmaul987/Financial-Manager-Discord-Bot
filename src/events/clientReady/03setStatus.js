import { ActivityType } from "discord.js";
import os from "os";
import { logger } from "../../utils/components/logger.js";
import { stripIndents } from "common-tags";

const updateBotStatus = (client) => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(1);
  const cpuUsagePercent = (100 - (totalIdle / totalTick) * 100).toFixed(1);

  const bioText = stripIndents`
  CPU              : ${cpuUsagePercent}%
  MEMORY    : ${memoryUsagePercent}%
  `;

  client.user.setPresence({
    activities: [
      {
        name: "Your Finances 💰",
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });

  client.application.edit({ description: bioText }).catch((err) => {
    logger.red("ERROR", `Bio update failed: ${err.message}`);
  });

  logger.magenta("SYSTEM", `Status set: Watching your finances 💰`);
  logger.magenta(
    "SYSTEM",
    `CPU: ${cpuUsagePercent}% | MEMORY: ${memoryUsagePercent}%`
  );
};

export default (client) => {
  updateBotStatus(client);

  setInterval(() => {
    updateBotStatus(client);
  }, 120000);
};
