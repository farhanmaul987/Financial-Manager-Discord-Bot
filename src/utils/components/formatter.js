import { createErrorEmbed } from "../embedLayout.js";
import { logger } from "./logger.js";

export function formatCurrency(number) {
  const roundedNumber = Math.round(number * 100) / 100;
  const hasDecimal = roundedNumber % 1 !== 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: hasDecimal ? 2 : 0,
  }).format(roundedNumber);
}

export function parseAmount(input) {
  if (typeof input !== "string") {
    logger.red("ERROR", "Amount harus berupa string");
    return {
      success: false,
      embed: createErrorEmbed(
        "Amount Tidak Valid",
        "Amount harus berupa string"
      ),
    };
  }

  const trimmed = input.trim();
  const normalized = trimmed.replace(/\s+/g, "");

  if (normalized.includes(",")) {
    if ((normalized.match(/,/g) || []).length > 1) {
      logger.red("ERROR", "Format angka tidak valid");
      return {
        success: false,
        embed: createErrorEmbed(
          "Amount Tidak Valid",
          "Format angka tidak valid"
        ),
      };
    }

    const replaced = normalized.replace(",", ".");
    const number = Number(replaced);

    if (Number.isNaN(number)) {
      logger.red("ERROR", "Amount bukan angka valid");
      return {
        success: false,
        embed: createErrorEmbed(
          "Amount Tidak Valid",
          "Amount bukan angka valid"
        ),
      };
    }

    return { success: true, amount: number };
  }

  const number = Number(normalized);

  if (Number.isNaN(number)) {
    logger.red("ERROR", "Amount bukan angka valid");
    return {
      success: false,
      embed: createErrorEmbed("Amount Tidak Valid", "Amount bukan angka valid"),
    };
  }

  return { success: true, amount: number };
}
