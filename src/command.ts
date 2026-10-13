import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
export const command = new SlashCommandBuilder()
  .setName("turnqueue")
  .setDescription("Preview a speaking-turn queue / Söz sırası önizle")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((o) =>
    o
      .setName("topic")
      .setDescription("Plain topic / Düz başlık (no links or mentions)")
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(100),
  )
  .addStringOption((o) =>
    o
      .setName("language")
      .setDescription("Panel language / Panel dili")
      .addChoices({ name: "Türkçe", value: "tr" }, { name: "English", value: "en" }),
  );
