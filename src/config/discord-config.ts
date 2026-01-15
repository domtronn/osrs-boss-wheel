// Read configuration from environment variables
// These must be set in .env file or as environment variables at build time
// Using obfuscated names to make them less obvious in built code
const _a = process.env.DISCORD_WEBHOOK_ID || "";
const _b = process.env.DISCORD_WEBHOOK_TOKEN || "";
const _c = process.env.DISCORD_TOTP_SECRET || "";

// Build webhook URL from parts at runtime
const _url = _a && _b ? `https://discord.com/api/webhooks/${_a}/${_b}` : "";

export const discordConfig = {
  // Obfuscated property names - don't rename these, they're referenced in discord.ts
  _d1: _a,          // webhook URL
  _d2: _b,          // webhook URL
  _s: _c,            // TOTP secret
  _t1: `🎡 We're killing **{bossName}** in {configType} boys!`,  // title template
  _t2: `**{bossName}**`,  // message template
  _e: !!(_url && _c),     // enabled flag
  _c: 0xFFFF00,           // embed color
};
