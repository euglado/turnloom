export type Language = "en" | "tr";
export type Action = "join" | "leave" | "next" | "pause" | "close";
export interface Queue {
  topic: string;
  language: Language;
  waiting: string[];
  current: string | null;
  paused: boolean;
  closed: boolean;
}
export class QueueError extends Error {}
export const words = {
  en: {
    join: "Join",
    leave: "Leave",
    next: "Next speaker",
    pause: "Pause / resume",
    close: "Close",
    current: "Speaking",
    waiting: "Waiting",
    empty: "Nobody",
    paused: "New joins paused",
    closed: "Queue closed",
    active: "Queue open",
    preview:
      "Publish this queue? IDs in the queue are visible to this channel. State lasts up to 24 hours or until restart. Voice is never controlled.",
    publish: "Publish",
    cancel: "Cancel",
    cancelled: "Cancelled.",
    saved: "Queue updated.",
    staff: "Manage Server permission is required.",
    expired:
      "This panel expired or the bot restarted. A manager can create a new queue with /turnqueue.",
    busy: "Another update is in progress. Try again in a moment.",
    duplicate: "You are already waiting or speaking.",
    full: "The queue has 50 waiting members. Try later.",
    notJoined: "You are not in this queue.",
    noNext: "Nobody is waiting. The current speaker stays unchanged.",
    pausedJoin: "New joins are paused. You can still leave.",
    failure:
      "Discord could not complete this action. Check channel permissions and try again. If a panel appeared, use that panel before creating another.",
    channel:
      "Use a regular server text channel where both you and the bot can view and send messages.",
    existing: "This server already has an active queue. Close it before creating another.",
    limits: "The bot is at capacity. Try again later.",
    notice:
      "Join/leave: everyone. Next/pause/close: Manage Server. No pings or voice control. Expires within 24h; restart clears state. Old messages remain until manually deleted.",
  },
  tr: {
    join: "Katıl",
    leave: "Ayrıl",
    next: "Sıradaki konuşmacı",
    pause: "Duraklat / sürdür",
    close: "Kapat",
    current: "Konuşan",
    waiting: "Bekleyenler",
    empty: "Kimse yok",
    paused: "Yeni katılımlar duraklatıldı",
    closed: "Sıra kapatıldı",
    active: "Sıra açık",
    preview:
      "Bu sıra yayımlansın mı? Sıradaki kullanıcı kimlikleri bu kanalda görünür. Durum en fazla 24 saat veya yeniden başlatmaya kadar tutulur. Ses kontrol edilmez.",
    publish: "Yayımla",
    cancel: "Vazgeç",
    cancelled: "İptal edildi.",
    saved: "Sıra güncellendi.",
    staff: "Sunucuyu Yönet izni gerekiyor.",
    expired:
      "Panelin süresi doldu veya bot yeniden başladı. Yetkili /turnqueue ile yeni sıra açabilir.",
    busy: "Başka bir güncelleme sürüyor. Birazdan tekrar deneyin.",
    duplicate: "Zaten bekliyorsunuz veya konuşuyorsunuz.",
    full: "50 kişilik bekleme sırası dolu. Daha sonra deneyin.",
    notJoined: "Bu sırada değilsiniz.",
    noNext: "Bekleyen yok. Mevcut konuşmacı değişmedi.",
    pausedJoin: "Yeni katılımlar duraklatıldı. Sıradan ayrılabilirsiniz.",
    failure:
      "Discord işlemi tamamlayamadı. Kanal izinlerini kontrol edip tekrar deneyin. Panel oluştuysa yeni panel açmadan önce onu kullanın.",
    channel:
      "Sizin ve botun görebildiği ve mesaj gönderebildiği normal bir sunucu metin kanalı kullanın.",
    existing: "Sunucuda etkin bir sıra var. Önce onu kapatın.",
    limits: "Bot kapasite sınırında. Daha sonra tekrar deneyin.",
    notice:
      "Katıl/ayrıl: herkes. İlerlet/duraklat/kapat: Sunucuyu Yönet. Bildirim veya ses kontrolü yok. En fazla 24 saat; yeniden başlatma durumu siler. Eski mesajları elle silmeniz gerekir.",
  },
} as const;
export function newQueue(topic: string, language: Language): Queue {
  const clean = topic
    .normalize("NFKC")
    .replace(/[\p{Cc}\p{Cf}]/gu, " ")
    .trim();
  if (!clean || clean.length > 100 || /[@<>`*_~|\\[\]]/u.test(clean)) {
    throw new QueueError(
      language === "tr"
        ? "1–100 karakterlik düz bir başlık kullanın; etiket, bağlantı veya biçimlendirme eklemeyin."
        : "Use a plain 1–100 character topic without mentions, links or formatting.",
    );
  }
  if (/https?:|www\./iu.test(clean))
    throw new QueueError(
      language === "tr" ? "Başlığa bağlantı eklemeyin." : "Do not include links in the topic.",
    );
  return { topic: clean, language, waiting: [], current: null, paused: false, closed: false };
}
export function transition(queue: Queue, action: Action, user: string, manager: boolean): Queue {
  const w = words[queue.language];
  if (queue.closed) throw new QueueError(w.expired);
  if (["next", "pause", "close"].includes(action) && !manager) throw new QueueError(w.staff);
  const q = { ...queue, waiting: [...queue.waiting] };
  switch (action) {
    case "join":
      if (q.paused) throw new QueueError(w.pausedJoin);
      if (q.current === user || q.waiting.includes(user)) throw new QueueError(w.duplicate);
      if (q.waiting.length >= 50) throw new QueueError(w.full);
      q.waiting.push(user);
      break;
    case "leave":
      if (q.current === user) q.current = null;
      else if (q.waiting.includes(user)) q.waiting = q.waiting.filter((id) => id !== user);
      else throw new QueueError(w.notJoined);
      break;
    case "next":
      if (!q.waiting.length) throw new QueueError(w.noNext);
      q.current = q.waiting.shift() ?? null;
      break;
    case "pause":
      q.paused = !q.paused;
      break;
    case "close":
      q.closed = true;
      q.current = null;
      q.waiting = [];
      break;
  }
  return q;
}
