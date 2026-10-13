import { ActionRowBuilder, ButtonBuilder, ButtonStyle, escapeMarkdown } from "discord.js";
import { type Queue, words } from "./queue.js";
export const noMentions = { parse: [] as [], repliedUser: false };
export function panel(q: Queue) {
  const w = words[q.language];
  const status = q.closed ? w.closed : q.paused ? w.paused : w.active;
  const waiting = q.waiting.map((id, index) => `${index + 1}. <@${id}>`).join("\n") || w.empty;
  return {
    content: `**${escapeMarkdown(q.topic)}** — ${status}\n${w.current}: ${q.current ? `<@${q.current}>` : w.empty}\n${w.waiting}:\n${waiting}\n\n${w.notice}`,
    allowedMentions: noMentions,
    components: q.closed
      ? []
      : [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...(["join", "leave", "next", "pause", "close"] as const).map((action) =>
              new ButtonBuilder()
                .setCustomId(`tl:${action}`)
                .setLabel(w[action])
                .setStyle(
                  action === "close"
                    ? ButtonStyle.Danger
                    : action === "join"
                      ? ButtonStyle.Success
                      : ButtonStyle.Secondary,
                )
                .setDisabled(action === "join" && q.paused),
            ),
          ),
        ],
  };
}
export function preview(q: Queue, id: string) {
  const w = words[q.language];
  return {
    ...panel(q),
    content: `${w.preview}\n\n${panel(q).content}`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`tl:publish:${id}`)
          .setLabel(w.publish)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`tl:cancel:${id}`)
          .setLabel(w.cancel)
          .setStyle(ButtonStyle.Secondary),
      ),
    ],
  };
}
