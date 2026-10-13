import assert from "node:assert/strict";
import test from "node:test";
import { command } from "../dist/command.js";
import { config } from "../dist/config.js";
import { newQueue, transition } from "../dist/queue.js";
import { panel, preview } from "../dist/ui.js";

test("FIFO advancement removes the speaker and leaves original state unchanged", () => {
  const a = transition(newQueue("Discussion", "en"), "join", "1", false);
  const b = transition(a, "join", "2", false);
  const c = transition(b, "next", "9", true);
  assert.equal(c.current, "1");
  assert.deepEqual(c.waiting, ["2"]);
  assert.deepEqual(b.waiting, ["1", "2"]);
  assert.equal(transition(c, "next", "9", true).current, "2");
});
test("duplicate waiting and current users cannot join", () => {
  const q = transition(newQueue("Talk", "en"), "join", "1", false);
  assert.throws(() => transition(q, "join", "1", false), /already/);
  assert.throws(() => transition(transition(q, "next", "9", true), "join", "1", false), /already/);
});
test("leave removes only yourself; current leaving does not advance automatically", () => {
  let q = transition(newQueue("Talk", "en"), "join", "1", false);
  q = transition(q, "join", "2", false);
  q = transition(q, "next", "9", true);
  q = transition(q, "leave", "1", false);
  assert.equal(q.current, null);
  assert.deepEqual(q.waiting, ["2"]);
  assert.throws(() => transition(q, "leave", "3", false), /not in/);
  assert.deepEqual(transition(q, "leave", "2", false).waiting, []);
});
for (const action of ["next", "pause", "close"])
  test(`non-manager cannot ${action}`, () => {
    assert.throws(() => transition(newQueue("Talk", "en"), action, "1", false), /Manage Server/);
  });
test("pause stops joins but allows departure; resume restores joins", () => {
  const q = transition(transition(newQueue("Talk", "en"), "join", "1", false), "pause", "9", true);
  assert.throws(() => transition(q, "join", "2", false), /paused/);
  assert.deepEqual(transition(q, "leave", "1", false).waiting, []);
  assert.deepEqual(transition(transition(q, "pause", "9", true), "join", "2", false).waiting, [
    "1",
    "2",
  ]);
});
test("empty next does not erase current speaker", () => {
  const q = transition(transition(newQueue("Talk", "en"), "join", "1", false), "next", "9", true);
  assert.throws(() => transition(q, "next", "9", true), /Nobody is waiting/);
  assert.equal(q.current, "1");
});
test("close clears user IDs and disables all actions", () => {
  const q = transition(transition(newQueue("Talk", "en"), "join", "1", false), "close", "9", true);
  assert.deepEqual(q.waiting, []);
  assert.equal(q.current, null);
  assert.deepEqual(panel(q).components, []);
  assert.throws(() => transition(q, "join", "1", false), /expired/);
});
test("capacity and worst-case Discord content length", () => {
  const q = newQueue("a".repeat(100), "tr");
  q.current = "99999999999999999999";
  for (let i = 0; i < 50; i++) q.waiting.push(String(10000000000000000000n + BigInt(i)));
  assert.throws(() => transition(q, "join", "new", false), /50/);
  assert.ok(panel(q).content.length <= 2000);
  assert.deepEqual(panel(q).allowedMentions.parse, []);
});
for (const topic of [
  "",
  "a".repeat(101),
  "@everyone",
  "<@123>",
  "**bold**",
  "https://example.com",
  "www.example.com",
  "＠everyone",
])
  test(`reject unsafe topic ${JSON.stringify(topic)}`, () =>
    assert.throws(() => newQueue(topic, "en")));
test("normalizes invisible control characters and accepts bilingual topics", () => {
  assert.equal(newQueue("  Topluluk\u200b sohbeti  ", "tr").topic, "Topluluk  sohbeti");
});
test("preview is bilingual and only contains confirm/cancel controls", () => {
  for (const language of ["en", "tr"]) {
    const p = preview(newQueue("Community", language), "draft");
    const row = p.components[0].toJSON();
    assert.deepEqual(
      row.components.map((x) => x.custom_id),
      ["tl:publish:draft", "tl:cancel:draft"],
    );
    assert.deepEqual(p.allowedMentions.parse, []);
  }
});
test("command defaults to manager-only without global-only fields", () => {
  const c = command.toJSON();
  assert.equal(c.default_member_permissions, "32");
  assert.equal(c.contexts, undefined);
  assert.equal(c.integration_types, undefined);
});
test("configuration fails closed without exposing values", () => {
  assert.throws(() => config({}), /Setup incomplete/);
  assert.throws(
    () => config({ DISCORD_TOKEN: "secret-value" }),
    (error) => !error.message.includes("secret-value"),
  );
  assert.equal(
    config({
      DISCORD_TOKEN: "x".repeat(40),
      DISCORD_APPLICATION_ID: "1".repeat(18),
      DISCORD_GUILD_ID: "2".repeat(18),
    }).guild,
    "2".repeat(18),
  );
});
