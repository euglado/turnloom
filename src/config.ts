export function config(env: NodeJS.ProcessEnv = process.env) {
  const token = env.DISCORD_TOKEN?.trim();
  const application = env.DISCORD_APPLICATION_ID?.trim();
  const guild = env.DISCORD_GUILD_ID?.trim();
  if (
    !token ||
    token.length < 30 ||
    /\s/.test(token) ||
    !/^\d{17,20}$/.test(application ?? "") ||
    !/^\d{17,20}$/.test(guild ?? "")
  ) {
    throw new Error("Setup incomplete / Kurulum eksik. Run npm run setup; keep .env private.");
  }
  return { token, application: application as string, guild: guild as string };
}
