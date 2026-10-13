import { randomUUID } from "node:crypto";
import {
  type ButtonInteraction,
  ChannelType,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { type Action, newQueue, type Queue, QueueError, transition, words } from "./queue.js";
import { noMentions, panel, preview } from "./ui.js";

type Input = ButtonInteraction | ChatInputCommandInteraction;
interface Draft {
  queue: Queue;
  owner: string;
  guild: string;
  channel: string;
  expires: number;
}
interface Board {
  queue: Queue;
  message: string;
  channel: string;
  expires: number;
  updated: number;
}
const permissions = PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages;
export class TurnLoom {
  readonly drafts = new Map<string, Draft>();
  readonly boards = new Map<string, Board>();
  readonly busy = new Set<string>();
  readonly published = new Map<string, number>();
  constructor(
    readonly now = Date.now,
    readonly makeId = randomUUID,
  ) {}
  sweep() {
    const now = this.now();
    for (const [id, d] of this.drafts) if (d.expires <= now) this.drafts.delete(id);
    for (const [id, b] of this.boards)
      if (b.expires <= now && !this.busy.has(id)) this.boards.delete(id);
    for (const [id, time] of this.published) if (time + 60_000 <= now) this.published.delete(id);
  }
  async handle(i: Input) {
    const language =
      i.isChatInputCommand() && i.options.getString("language") === "tr" ? "tr" : "en";
    let w: (typeof words)[keyof typeof words] = words[language];
    const say = (content: string) =>
      i.reply({ content, flags: MessageFlags.Ephemeral, allowedMentions: noMentions });
    if (
      !i.guildId ||
      i.channel?.type !== ChannelType.GuildText ||
      !i.memberPermissions?.has(permissions) ||
      !i.appPermissions?.has(permissions)
    ) {
      await say(w.channel);
      return;
    }
    const guild = i.guildId;
    this.sweep();
    if (this.busy.has(guild)) {
      await say(w.busy);
      return;
    }
    this.busy.add(guild);
    try {
      const manager = i.memberPermissions.has(PermissionFlagsBits.ManageGuild);
      if (i.isChatInputCommand()) {
        if (i.commandName !== "turnqueue") return;
        if (!manager) throw new QueueError(w.staff);
        if (this.boards.has(guild)) throw new QueueError(w.existing);
        if (this.drafts.size >= 1000) throw new QueueError(w.limits);
        const q = newQueue(i.options.getString("topic", true), language);
        const id = this.makeId();
        const draft = {
          queue: q,
          owner: i.user.id,
          guild,
          channel: i.channelId,
          expires: this.now() + 600_000,
        };
        this.drafts.set(id, draft);
        try {
          await i.reply({ ...preview(q, id), flags: MessageFlags.Ephemeral });
        } catch (error) {
          this.drafts.delete(id);
          throw error;
        }
        return;
      }
      const [prefix, action, id] = i.customId.split(":");
      if (prefix !== "tl") return;
      if (action === "publish" || action === "cancel") {
        const d = id ? this.drafts.get(id) : undefined;
        if (!d || d.owner !== i.user.id || d.guild !== guild || d.channel !== i.channelId)
          throw new QueueError(w.expired);
        w = words[d.queue.language];
        if (!manager) throw new QueueError(w.staff);
        if (action === "cancel") {
          this.drafts.delete(id as string);
          await i.update({ content: w.cancelled, components: [], allowedMentions: noMentions });
          return;
        }
        if (this.boards.has(guild)) throw new QueueError(w.existing);
        if (this.boards.size >= 1000) throw new QueueError(w.limits);
        if (this.published.has(guild)) throw new QueueError(w.busy);
        await i.deferUpdate();
        // Keep the draft until Discord confirms the send. Once sent, never send it twice.
        const message = await i.channel.send(panel(d.queue));
        this.boards.set(guild, {
          queue: d.queue,
          channel: i.channelId,
          message: message.id,
          expires: this.now() + 86_400_000,
          updated: 0,
        });
        this.published.set(guild, this.now());
        this.drafts.delete(id as string);
        await i.editReply({ content: message.url, components: [], allowedMentions: noMentions });
        return;
      }
      const b = this.boards.get(guild);
      if (!b || b.channel !== i.channelId || b.message !== i.message.id)
        throw new QueueError(w.expired);
      w = words[b.queue.language];
      if (!["join", "leave", "next", "pause", "close"].includes(action ?? ""))
        throw new QueueError(w.expired);
      if (b.updated + 1000 > this.now()) throw new QueueError(w.busy);
      const q = transition(b.queue, action as Action, i.user.id, manager);
      await i.deferReply({ flags: MessageFlags.Ephemeral });
      // Commit state only after Discord accepts the panel edit; a failed edit is retryable.
      await i.message.edit(panel(q));
      if (q.closed) this.boards.delete(guild);
      else this.boards.set(guild, { ...b, queue: q, updated: this.now() });
      await i.editReply({ content: w.saved, allowedMentions: noMentions });
    } catch (error) {
      const content = error instanceof QueueError ? error.message : w.failure;
      // Never log raw Discord errors: they can contain request payloads or tokens.
      try {
        if (i.deferred || i.replied) await i.editReply({ content, allowedMentions: noMentions });
        else await say(content);
      } catch {
        console.error(
          "Could not deliver an interaction response. Check Discord connectivity and permissions.",
        );
      }
    } finally {
      this.busy.delete(guild);
    }
  }
}
