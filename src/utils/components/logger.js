import clc from "cli-color";

const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());

  const hour = pad(now.getHours());
  const min = pad(now.getMinutes());

  return `${day}/${month}/${year} ${hour}:${min}`;
};

const green = (status, msg) => {
  const timestamp = clc.cyanBright(`[${getTimestamp()}]`);
  console.log(`${timestamp} ${clc.greenBright(`[${status}]`)} ${msg}`);
};

const red = (status, msg) => {
  const timestamp = clc.cyanBright(`[${getTimestamp()}]`);
  console.log(`${timestamp} ${clc.redBright(`[${status}]`)} ${msg}`);
};

const yellow = (status, msg) => {
  const timestamp = clc.cyanBright(`[${getTimestamp()}]`);
  console.log(`${timestamp} ${clc.yellowBright(`[${status}]`)} ${msg}`);
};

const blue = (status, msg) => {
  const timestamp = clc.cyanBright(`[${getTimestamp()}]`);
  console.log(`${timestamp} ${clc.blueBright(`[${status}]`)} ${msg}`);
};

const magenta = (status, msg) => {
  const timestamp = clc.cyanBright(`[${getTimestamp()}]`);
  console.log(`${timestamp} ${clc.magentaBright(`[${status}]`)} ${msg}`);
};

const command = (interaction) => {
  const timestamp = clc.cyanBright(`[${getTimestamp()}]`);
  const magenta = clc.magentaBright(`[COMMAND]`);

  const user = clc.magentaBright(interaction.user?.tag ?? "UnknownUser");

  const baseCmd = interaction.commandName;
  const subCmd = interaction.options.getSubcommand(false); // false biar nggak error kalau ga ada subcommand

  const cmdFormatted = subCmd
    ? `${clc.greenBright(baseCmd)}-${clc.greenBright(subCmd)}`
    : clc.greenBright(baseCmd);

  const options = interaction.options?._hoistedOptions || [];
  const optText = options.length
    ? clc.yellowBright(`(${options.map((opt) => opt.value).join(", ")})`)
    : "";

  console.log(`${timestamp} ${magenta} ${user}: ${cmdFormatted} ${optText}`);
};

export const logger = {
  green,
  red,
  yellow,
  blue,
  magenta,
  command,
};
