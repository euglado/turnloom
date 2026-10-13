import assert from "node:assert/strict";
import test from "node:test";
import { ChannelType, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { TurnLoom } from "../dist/bot.js";

const base = PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages;
function fixture() {
  let time = 1_000_000;
  let sequence = 0;
  const bot = new TurnLoom(
    () => time,
    () => `draft${++sequence}`,
  );
  const sent = [];
  const edits = [];
  const channel = {
    type: ChannelType.GuildText,
    send: async (p) => {
      sent.push(p);
      return { id: "message", url: "https://discord.com/channels/g/c/message" };
    },
  };
  function input(options = {}) {
    const replies = [];
    return {
      guildId: "g",
      channelId: "c",
      channel,
      user: { id: "owner" },
      memberPermissions: new PermissionsBitField(base | PermissionFlagsBits.ManageGuild),
      appPermissions: new PermissionsBitField(base),
      commandName: "turnqueue",
      customId: "tl:publish:draft1",
      options: { getString: (key) => (key === "topic" ? "Community discussion" : "en") },
      isChatInputCommand: () => false,
      message: {
        id: "message",
        edit: async (p) => {
          edits.push(p);
        },
      },
      replies,
      deferred: false,
      replied: false,
      async reply(p) {
        this.replied = true;
        replies.push(p);
      },
      async update(p) {
        this.replied = true;
        replies.push(p);
      },
      async deferUpdate() {
        this.deferred = true;
      },
      async deferReply(p) {
        this.deferred = true;
        replies.push(p);
      },
      async editReply(p) {
        replies.push(p);
      },
      ...options,
    };
  }
  async function open() {
    await bot.handle(input({ isChatInputCommand: () => true }));
    await bot.handle(input());
  }
  return {
    bot,
    input,
    open,
    sent,
    edits,
    tick: (n = 2000) => {
      time += n;
    },
  };
}
test("command produces only a private preview; confirmation publishes once", async () => {
  const f = fixture();
  const i = f.input({ isChatInputCommand: () => true });
  await f.bot.handle(i);
  assert.equal(f.sent.length, 0);
  assert.equal(i.replies[0].flags, 64);
  await f.bot.handle(f.input());
  await f.bot.handle(f.input());
  assert.equal(f.sent.length, 1);
  assert.equal(f.bot.drafts.size, 0);
});
for (const override of [{ user: { id: "other" } }, { guildId: "other" }, { channelId: "other" }])
  test(`draft bound to ${JSON.stringify(override)}`, async () => {
    const f = fixture();
    await f.bot.handle(f.input({ isChatInputCommand: () => true }));
    await f.bot.handle(f.input(override));
    assert.equal(f.sent.length, 0);
  });
test("cancel consumes a draft without publication", async () => {
  const f = fixture();
  await f.bot.handle(f.input({ isChatInputCommand: () => true }));
  await f.bot.handle(f.input({ customId: "tl:cancel:draft1" }));
  assert.equal(f.bot.drafts.size, 0);
  assert.equal(f.sent.length, 0);
});
test("permission revoked between preview and publish prevents sending", async () => {
  const f = fixture();
  await f.bot.handle(f.input({ isChatInputCommand: () => true }));
  await f.bot.handle(f.input({ memberPermissions: new PermissionsBitField(base) }));
  assert.equal(f.sent.length, 0);
});
test("draft TTL and queue TTL clear memory; stale clicks cannot recreate state", async () => {
  const f = fixture();
  await f.bot.handle(f.input({ isChatInputCommand: () => true }));
  f.tick(600_000);
  await f.bot.handle(f.input());
  assert.equal(f.sent.length, 0);
  await f.bot.handle(f.input({ isChatInputCommand: () => true }));
  await f.bot.handle(f.input({ customId: "tl:publish:draft2" }));
  f.tick(86_400_001);
  f.bot.sweep();
  assert.equal(f.bot.boards.size, 0);
  await f.bot.handle(f.input({ customId: "tl:join" }));
  assert.equal(f.edits.length, 0);
});
test("one active board per guild; another guild is independent", async () => {
  const f = fixture();
  await f.open();
  await f.bot.handle(f.input({ isChatInputCommand: () => true }));
  assert.equal(f.bot.drafts.size, 0);
  await f.bot.handle(f.input({ isChatInputCommand: () => true, guildId: "g2" }));
  await f.bot.handle(f.input({ guildId: "g2", customId: "tl:publish:draft2" }));
  assert.equal(f.bot.boards.size, 2);
});
test("regular members can join; cannot advance; wrong message cannot mutate queue", async () => {
  const f = fixture();
  await f.open();
  const member = { memberPermissions: new PermissionsBitField(base), user: { id: "member" } };
  await f.bot.handle(f.input({ ...member, customId: "tl:join" }));
  assert.deepEqual(f.bot.boards.get("g").queue.waiting, ["member"]);
  f.tick();
  await f.bot.handle(f.input({ ...member, customId: "tl:next" }));
  assert.equal(f.bot.boards.get("g").queue.current, null);
  await f.bot.handle(f.input({ customId: "tl:next", message: { id: "fake" } }));
  assert.equal(f.bot.boards.get("g").queue.current, null);
});
test("failed Discord edit preserves state and releases lock", async () => {
  const f = fixture();
  await f.open();
  const i = f.input({
    customId: "tl:join",
    message: {
      id: "message",
      edit: async () => {
        throw Error("sensitive-request");
      },
    },
  });
  await f.bot.handle(i);
  assert.deepEqual(f.bot.boards.get("g").queue.waiting, []);
  assert.equal(f.bot.busy.size, 0);
  assert.ok(!JSON.stringify(i.replies).includes("sensitive-request"));
  await f.bot.handle(f.input({ customId: "tl:join" }));
  assert.deepEqual(f.bot.boards.get("g").queue.waiting, ["owner"]);
});
test("failed send can retry the same draft", async () => {
  const f = fixture();
  await f.bot.handle(f.input({ isChatInputCommand: () => true }));
  await f.bot.handle(
    f.input({
      channel: {
        type: ChannelType.GuildText,
        send: async () => {
          throw Error("secret");
        },
      },
    }),
  );
  assert.equal(f.bot.boards.size, 0);
  assert.equal(f.bot.drafts.size, 1);
  await f.bot.handle(f.input());
  assert.equal(f.sent.length, 1);
});
test("failed final acknowledgement never duplicates a published panel", async () => {
  const f = fixture();
  await f.bot.handle(f.input({ isChatInputCommand: () => true }));
  await f.bot.handle(
    f.input({
      editReply: async () => {
        throw Error("offline");
      },
    }),
  );
  await f.bot.handle(f.input());
  assert.equal(f.sent.length, 1);
  assert.equal(f.bot.boards.size, 1);
});
test("overlapping clicks are serialized before any external await", async () => {
  const f = fixture();
  await f.open();
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const first = f.bot.handle(
    f.input({ customId: "tl:join", message: { id: "message", edit: () => gate } }),
  );
  const second = f.input({ customId: "tl:join", user: { id: "second" } });
  await f.bot.handle(second);
  assert.match(second.replies[0].content, /progress/);
  release();
  await first;
  assert.deepEqual(f.bot.boards.get("g").queue.waiting, ["owner"]);
});
test("publication race from different drafts sends only one panel", async () => {
  const f = fixture();
  await f.bot.handle(f.input({ isChatInputCommand: () => true }));
  await f.bot.handle(f.input({ isChatInputCommand: () => true }));
  await Promise.all([
    f.bot.handle(f.input()),
    f.bot.handle(f.input({ customId: "tl:publish:draft2" })),
  ]);
  assert.equal(f.sent.length, 1);
});
test("update throttle and close/reopen cooldown bound message traffic", async () => {
  const f = fixture();
  await f.open();
  await f.bot.handle(f.input({ customId: "tl:join" }));
  await f.bot.handle(f.input({ customId: "tl:leave" }));
  assert.deepEqual(f.bot.boards.get("g").queue.waiting, ["owner"]);
  f.tick();
  await f.bot.handle(f.input({ customId: "tl:close" }));
  assert.equal(f.bot.boards.size, 0);
  await f.bot.handle(f.input({ isChatInputCommand: () => true }));
  await f.bot.handle(f.input({ customId: "tl:publish:draft2" }));
  assert.equal(f.sent.length, 1);
  f.tick(60_000);
  await f.bot.handle(f.input({ customId: "tl:publish:draft2" }));
  assert.equal(f.sent.length, 2);
});
for (const override of [
  { guildId: null },
  { channel: { type: ChannelType.PublicThread } },
  { appPermissions: new PermissionsBitField(0n) },
  { memberPermissions: new PermissionsBitField(PermissionFlagsBits.ViewChannel) },
])
  test(`invalid context/permissions fails closed ${JSON.stringify(override)}`, async () => {
    const f = fixture();
    await f.bot.handle(f.input({ isChatInputCommand: () => true, ...override }));
    assert.equal(f.bot.drafts.size, 0);
    assert.equal(f.sent.length, 0);
  });
