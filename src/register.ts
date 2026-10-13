import { REST, Routes } from "discord.js";
import { command } from "./command.js";
import { config } from "./config.js";

async function register() {
  const c = config();
  // POST upserts this named command and leaves other commands in this app untouched.
  await new REST({ version: "10" })
    .setToken(c.token)
    .post(Routes.applicationGuildCommands(c.application, c.guild), { body: command.toJSON() });
  console.log("Registered /turnqueue in your server / Komut sunucunuza kaydedildi.");
  console.log(
    `Invite / Davet: https://discord.com/oauth2/authorize?client_id=${c.application}&scope=bot%20applications.commands&permissions=3072&integration_type=0`,
  );
}
register().catch(() => {
  console.error(
    "Registration failed. Run setup and check application/server IDs, token and bot installation privately.",
  );
  process.exitCode = 1;
});
