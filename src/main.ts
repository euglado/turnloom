import { Client, Events, GatewayIntentBits, Options } from "discord.js";
import { TurnLoom } from "./bot.js";
import { config } from "./config.js";

async function main() {
  const c = config();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: { parse: [], repliedUser: false },
    makeCache: Options.cacheWithLimits({
      MessageManager: 0,
      GuildMemberManager: 0,
      UserManager: 0,
    }),
  });
  const bot = new TurnLoom();
  client.once(Events.ClientReady, (ready) => {
    if (ready.user.id !== c.application) {
      console.error("Application ID does not match the bot token. Run setup again.");
      client.destroy();
      process.exitCode = 1;
      return;
    }
    console.log("TurnLoom online / çevrimiçi. No message-content or voice access.");
  });
  client.on(Events.InteractionCreate, (i) => {
    if (
      (i.isChatInputCommand() && i.commandName === "turnqueue") ||
      (i.isButton() && i.customId.startsWith("tl:"))
    ) {
      void bot
        .handle(i)
        .catch(() =>
          console.error("Interaction delivery failed; check connectivity and permissions."),
        );
    }
  });
  client.on(Events.Error, () =>
    console.error("Discord connection error. Check network and Developer Portal settings."),
  );
  const sweep = setInterval(() => bot.sweep(), 60_000);
  sweep.unref();
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      clearInterval(sweep);
      client.destroy();
    });
  try {
    await client.login(c.token);
  } catch {
    clearInterval(sweep);
    client.destroy();
    throw new Error(
      "Discord login failed. Check your token privately in Developer Portal; do not post it in support requests.",
    );
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Startup failed.");
  process.exitCode = 1;
});
