import { existsSync, writeFileSync } from "node:fs";
import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";
import { config } from "../dist/config.js";

async function secret() {
  if (!process.stdin.isTTY || !process.stdin.setRawMode)
    throw Error("Open a local interactive terminal / Yerel etkileşimli terminal açın.");
  process.stdout.write("Bot token (hidden / gizli): ");
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = (error) => {
      process.stdin.removeListener("keypress", onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const onKey = (text, key) => {
      if (key?.ctrl && key.name === "c") finish(Error("Cancelled / İptal edildi."));
      else if (key?.name === "return" || key?.name === "enter") finish();
      else if (key?.name === "backspace") value = value.slice(0, -1);
      else if (text && /^[A-Za-z0-9._-]+$/.test(text)) value += text;
    };
    process.stdin.on("keypress", onKey);
  });
}
async function setup() {
  if (process.versions.node.split(".")[0] !== "24")
    throw Error("Install Node.js 24 LTS / Node.js 24 LTS kurun.");
  if (existsSync(".env"))
    throw Error(
      ".env already exists; it was preserved. To reconfigure, privately delete .env and run setup again / .env korundu; yeniden yapılandırmak için özel dosyayı silip kurulumu tekrar çalıştırın.",
    );
  console.log(
    "Never share your token. Input is hidden; clipboard paste then Enter / Tokenı paylaşmayın. Giriş gizli; yapıştırıp Enter'a basın.",
  );
  const token = await secret();
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const application = (await rl.question("Application ID / Uygulama kimliği: ")).trim();
    const guild = (await rl.question("Server ID / Sunucu kimliği: ")).trim();
    config({ DISCORD_TOKEN: token, DISCORD_APPLICATION_ID: application, DISCORD_GUILD_ID: guild });
    writeFileSync(
      ".env",
      `DISCORD_TOKEN=${token}\nDISCORD_APPLICATION_ID=${application}\nDISCORD_GUILD_ID=${guild}\n`,
      { flag: "wx", mode: 0o600 },
    );
    console.log("Saved private .env / Özel .env kaydedildi. Run npm run register, then npm start.");
  } finally {
    rl.close();
  }
}
setup().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
