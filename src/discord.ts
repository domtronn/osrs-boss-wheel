import { TOTP } from "otpauth";
import { discordConfig } from "./config/discord-config";
import type { WheelItem } from "./config/config-base";

/**
 * Verifies a 6-digit TOTP code against the configured secret
 * @param code The 6-digit code from the user's authenticator app
 * @returns true if the code is valid, false otherwise
 */
export function verifyTOTP(code: string): boolean {
  // Remove any whitespace or formatting
  const cleanCode = code.replace(/\s/g, "");

  // Validate format (6 digits)
  if (!/^\d{6}$/.test(cleanCode)) {
    return false;
  }

  // Create TOTP instance with the configured secret
  const totp = new TOTP({
    secret: discordConfig._s,
    digits: 6,
    period: 30,
  });

  // Verify with ±1 time step window (allows for slight clock drift)
  const delta = totp.validate({
    token: cleanCode,
    window: 1,
  });

  // delta is null if invalid, or a number indicating how many steps away the code is
  return delta !== null;
}

/**
 * Posts the selected boss result to Discord via webhook
 * @param winner The selected boss item
 * @param configType The config type (team/duos/solos)
 * @param code The 6-digit TOTP code for authorization
 * @param imageUrl The image URL for the boss (used in the embed)
 * @throws Error if TOTP is invalid or the webhook request fails
 */
export async function postToDiscord(
  winner: WheelItem,
  configType: string,
  code: string,
  imageUrl?: string
): Promise<void> {
  // Check if Discord integration is enabled
  if (!discordConfig._e) {
    throw new Error("Discord integration is disabled");
  }

  // Verify TOTP code first
  if (!verifyTOTP(code)) {
    throw new Error("Invalid code");
  }

  // Construct URLs for transport and equipment
  const transportUrl = winner.wikiUrl
    ? `${winner.wikiUrl}/Strategies#Transportation`
    : "";
  const equipmentUrl = winner.wikiUrl
    ? `${winner.wikiUrl}/Strategies#Equipment`
    : "";

  const template = (s) => s
    .replace(/{bossName}/g, winner.name)
    .replace(/{transportUrl}/g, transportUrl)
    .replace(/{equipmentUrl}/g, equipmentUrl)
    .replace(/{configType}/g, configType.charAt(0).toUpperCase() + configType.slice(1));

  // Replace template placeholders
  const message = template(discordConfig._t2)
  const title = template(discordConfig._t1)

  // Construct Discord embed
  const embed = {
    title: title,
    description: message,
    color: discordConfig._c,
    thumbnail: imageUrl
      ? {
          url: imageUrl,
        }
      : undefined,
    fields: [
      {
        name: "🗺️ Getting There",
        value: transportUrl ? `[Transportation Guide](${transportUrl})` : "N/A",
        inline: true,
      },
      {
        name: "⚔️ Equipment",
        value: equipmentUrl ? `[Equipment Setup](${equipmentUrl})` : "N/A",
        inline: true,
      },
    ],
    footer: {
      text: "OSRS Boss Wheel",
    },
    timestamp: new Date().toISOString(),
  };

  // Send to Discord webhook
  const response = await fetch("https://discord.com/api/webhooks/" + discordConfig._d1 + "/" + discordConfig._d2, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      embeds: [embed],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to post to Discord: ${response.status} ${errorText}`);
  }
}
