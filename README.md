# TurnLoom

**Türkçe:** Discord sohbetleri, topluluk buluşmaları ve çalışma grupları için düğmeli söz sırası botu.

**English:** A button-driven speaking-turn queue for Discord discussions, community meetings and study groups.

Self-hosted • MIT • Turkish / English • Node.js 24 • discord.js 14

This repository contains a real Discord Gateway bot, not a hosted service. You supply your own Discord application, token and running computer. Automated tests simulate Discord interactions; a live token/server and production hosting have not been tested. CI validates Windows, macOS and Linux; it does not deploy a bot.

## Türkçe

### Amaç ve özellikler

Sohbette kimin sırada olduğunu tek bir mesajda gösterir. Sunucuyu Yönet yetkili bir kişi `/turnqueue` komutuyla özel önizleme açar, sonra **Yayımla** düğmesiyle kanala sıra paneli gönderir. Üyeler **Katıl** ve **Ayrıl** düğmelerini kullanır. Yetkililer **Sıradaki konuşmacı**, **Duraklat / sürdür** ve **Kapat** düğmeleriyle toplantıyı yürütür. Yeni katılımlar duraklatıldığında sıradan ayrılmak mümkündür. Boş sırada ilerletme mevcut konuşmacıyı silmez. Konuşmacı ayrılırsa yeni konuşmacı otomatik seçilmez.

Bot ses kanalına bağlanmaz, mikrofon açmaz/kapatmaz, üyeleri taşımaz, ses kaydetmez, mesaj içeriği veya üye geçmişi okumaz. Konuşma süresi ölçmez, konuşmacının gerçekten konuştuğunu doğrulamaz, otomatik moderasyon yapmaz. Sıra gönüllüdür; organizatörler topluluk kurallarını insan değerlendirmesiyle uygular. Kimliklerin sırada görünmesi dışında anonimlik sağlamaz.

### Gereksinimler

- Windows, macOS veya Linux; [Node.js 24 LTS](https://nodejs.org/en/download) ve birlikte gelen npm. Yeni kurulumdan sonra terminali tekrar açın. `node --version` çıktısı `v24...` olmalı.
- İnternete HTTPS ve Discord Gateway üzerinden erişebilen, bot açık kaldığı sürece çalışacak bir bilgisayar veya sunucu.
- Kendi Discord hesabınız ve bot ekleyebildiğiniz bir deneme sunucusu. Kurulumu ve sıra yönetimini yapacak kullanıcıda **Sunucuyu Yönet / Manage Server** izni.
- Bir Discord uygulaması ve bot tokenı. Ücretli hizmet veya başka API anahtarı gerekmez. Discord'un [Geliştirici Politikası](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy) ve [şartlarına](https://discord.com/developers/docs/policies-and-agreements/developer-terms-of-service) uyun.

### Kurulum: Developer Portal'dan çalışan bota

1. [Discord Developer Portal](https://discord.com/developers/applications) sayfasında **New Application** seçin; uygulamaya bir ad verin. **General Information → Application ID** değerini kopyalayın. Bu değer Public Key veya Client Secret değildir.
2. **Bot** sekmesinde gerekirse bot kullanıcısını oluşturun, **Reset Token** ile tokenı alın. Tokenı yalnızca kendi bilgisayarınızdaki kurulum istemine yapıştırın. Ekran görüntüsüne, GitHub'a, sohbete veya destek talebine eklemeyin. Sızarsa Portal'da hemen sıfırlayın; eski token geçersiz olur.
3. **Privileged Gateway Intents** altındaki Message Content, Server Members ve Presence seçeneklerini **kapalı bırakın**. Kod yalnızca ayrıcalıksız `Guilds` intentini kullanır. **Interactions Endpoint URL** alanını boş bırakın: etkileşimler Gateway bağlantısına gelir.
4. **Installation** bölümünde **Guild Install** kullanın; User Install gerekmez. Varsayılan kapsamlar **bot** ve **applications.commands**; bot izinleri yalnızca **View Channels** ve **Send Messages** olsun. Administrator seçmeyin. Portal'ın Install Link bağlantısını açıp deneme sunucunuzu seçin ve yetkilendirin. Davet URL'sindeki izin sayısı `3072` olmalıdır. Arayüz adları değişirse aynı kapsam ve izinleri seçin.
5. Discord **User Settings → Advanced → Developer Mode** açın. Sunucu simgesine sağ tıklayıp **Copy Server ID** seçin. Kanal kimliği değil, sunucu kimliği gerekir.
6. Bu deponun **Code → Download ZIP** seçeneğiyle kaynaklarını indirin ve arşivi normal, size ait özel bir klasöre çıkarın. Arşivin içinden çalıştırmayın. Token içereceği için paylaşılan veya herkese açık/senkronize klasörlerden kaçının. Kaynak kod düzenlemeniz gerekmez.
7. Windows'ta `setup.cmd` dosyasını açın. macOS/Linux'ta çıkarılan klasörde terminal açıp `bash setup.sh` çalıştırın. Yardımcı; kilitli bağımlılıkları kurar, TypeScript'i derler, tokenı ekranda göstermeden sorar, uygulama/sunucu kimliklerini alır, özel `.env` dosyasını oluşturur ve komutu sunucunuza kaydeder. Gizli token alanına yapıştırıp Enter'a basın; yıldız da gösterilmez.
8. Windows'ta `start.cmd`; macOS/Linux'ta `bash start.sh` çalıştırın. Terminalde **TurnLoom online / çevrimiçi** göründüğünde bot hazırdır. Terminal açık kalsın. Sunucuda normal bir metin kanalında `/turnqueue` yazın; aşağıdaki denemeyi yapın.

Terminali tercih ederseniz aynı klasörde sırasıyla:

```sh
npm ci --ignore-scripts
npm run build
npm run setup
npm run register
npm start
```

### Yapılandırma ve botu açık tutma

Kurulum, `.env` içinde `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID` ve `DISCORD_GUILD_ID` değerlerini tutar. Token kimlik doğrulama içindir; uygulama kimliği doğru botla eşleşmelidir. Sunucu kimliği komutun hangi sunucuya kaydedileceğini belirler. Değerler kodun parçası değildir; `.env` Git tarafından yok sayılır. POSIX'te dosya `0600` ile oluşturulur; Windows'ta klasör erişimini işletim sistemi hesabınızla sınırlayın. Yedeklerin ve eşitlemenin de tokenı içerebileceğini unutmayın.

Kurulum var olan `.env` dosyasının üstüne yazmaz. Token değiştirmek için botu durdurun, kendi özel `.env` dosyanızı silin ve `npm run setup` çalıştırın. Kimlik/sunucu değiştiyse `npm run register` komutunu tekrar çalıştırın. Kaynak kod düzenlemek gerekmez. Başka sunucuya davet ettikten sonra komutu o sunucu için kaydedin; daha önce kaydedilmiş sunucu komutu kendiliğinden silinmez. Komut kaydı aynı adlı komutu ekler/günceller; diğer uygulama komutlarını topluca silmez.

Bilgisayar kapanır, uykuya geçer, internet kesilir veya terminal kapanırsa bot hizmet veremez. Sürekli kullanım için kendi güvenilir sunucunuzda yalnızca **bir** bot işlemini açık tutun; işlem yöneticisini bu klasörde `npm start` çalıştıracak şekilde ayarlayın. Sağlayıcınızın gizli değişken kasası varsa üç değişkeni oradan sağlayabilirsiniz; `.env` yokken `npm start` ortamı kullanır. Statik site hostingi uygun değildir. Bu proje VDS kurmaz, mevcut servisleri değiştirmez veya otomatik dağıtım yapmaz. Her yeniden başlatma etkin sıraları siler; otomatik yeniden başlatma kalıcı kuyruk sağlamaz.

### Kullanım ve ilk deneme

1. **Sunucuyu Yönet** yetkili kullanıcı, normal metin kanalında `/turnqueue topic:Haftalık topluluk sohbeti language:tr` çalıştırır. İngilizce panel için `language:en`; varsayılan İngilizcedir. Başlık 1–100 düz karakter olmalı; bağlantı, etiket veya Markdown biçimlendirmesi eklemeyin.
2. Özel önizlemede başlığı, görünürlüğü ve veri sınırlarını inceleyin. **Vazgeç** hiçbir şey yayımlamaz. **Yayımla** paneli aynı kanala gönderir. Önizleme on dakika geçerlidir ve onu açan kullanıcı, sunucu ve kanala bağlıdır. Yayın sırasında yetki yeniden kontrol edilir.
3. Normal bir üye **Katıl** düğmesine basar; başka bir üyeyle aynı işlemi deneyin. Yalnızca katılan kişinin kimliği eklenir. Aynı kişi hem konuşan hem bekleyen olamaz. **Ayrıl** yalnızca düğmeye basan kişiyi çıkarır.
4. Yetkili **Sıradaki konuşmacı** düğmesine bastığında ilk gelen ilk konuşur. Önceki konuşmacı otomatik olarak sıranın sonuna eklenmez. Sıra yalnızca panelde ilerler; üyeler mikrofonlarını kendileri yönetir. **Duraklat / sürdür** yeni katılımı durdurur/açar. **Kapat** bellekteki üyeleri temizler, düğmeleri kaldırır ve yeni sıra oluşturulmasına izin verir.
5. Bildirim pingleri kapalıdır; panelde görünen kullanıcı etiketleri görsel kimlik içindir. Kullanıcı başına otomatik DM gönderilmez.

Sunucu başına tek etkin panel, panel başına 50 bekleyen ve ayrıca bir konuşmacı desteklenir. Başarılı panel değişiklikleri arasında bir saniye, aynı sunucuda yayınlar arasında 60 saniye beklenir. Eşzamanlı tıklamalarda ikinci işlem beklemek yerine anlaşılır hata alır ve tekrar denenebilir. Discord düzenlemesi başarısızsa sıra bellekte ilerletilmez. Bot en fazla 1.000 etkin sunucu paneli ve 1.000 önizleme tutar. Tek işlem içindeki sınırlar çoklu bot süreçleri arasında paylaşılmaz; aynı tokenla birden fazla kopya çalıştırmayın.

### İzinler

Bot için **View Channel (1024)** ve **Send Messages (2048)** yeterlidir. Administrator, Manage Messages, Manage Roles, Read Message History, Connect, Speak veya ayrıcalıklı intent istemez. Embed Link gerekmez; panel düz mesaj ve düğmelerdir. Kurulumcu/organizatörün **Manage Server (32)** izni gerekir; botun kendisine bu izni vermeyin. Kullanıcıların normal metin kanalını görme, mesaj gönderme ve slash komut kullanma izni olmalıdır. Kanal geçersiz kılmaları bot veya kullanıcı erişimini engelliyorsa bot işlem yapmaz. Özel mesajlar, forumlar, duyuru kanalları, ses kanalı sohbetleri ve thread'ler desteklenmez.

### Güvenlik, gizlilik ve sınırlar

Etkin panel için konu, dil, sunucu/kanal/mesaj kimlikleri ve bekleyen/konuşan kullanıcı kimlikleri yalnızca işlem belleğinde tutulur. Önizleme ayrıca başlatan kullanıcının kimliğini tutar; on dakikada geçersizleşir. Etkin sıranın ömrü **oluşturulduktan itibaren 24 saattir**, etkinlik bu süreyi uzatmaz. Bellek temizliği en geç izleyen dakikalık taramada yapılır. **Ayrıl**, **Kapat** veya bot yeniden başlatması ilgili sıradaki kişisel veriyi bellekten kaldırır. Kimliklerin ekranda görünen adlara dönüşümünü Discord yapar; bot kişi adı veya mesaj geçmişi arşivlemez. Telemetri, veritabanı, dosya veri deposu veya harici analiz servisi yoktur. Operatörün barındırma ve sistem logları kendi sorumluluğundadır; uygulama token veya ham Discord hataları yazdırmaz.

**Discord mesajları ayrı bir veri kopyasıdır.** Panel kanal izni olan herkese açıktır. Sıradan ayrılma veya kapatma paneli günceller; yeniden başlatma ve süre dolması ise eski mesajı kendiliğinden düzenlemez/silmez. Eski kullanıcı kimlikleri bu mesajlarda kalabilir. Toplantı sonrasında yöneticiler artık gerekmeyen panelleri Discord üzerinden silmelidir. Süresi dolmuş düğmeler yeni sırayı değiştiremez. Discord'un kendi saklama süreçleri botun kontrolünde değildir. Hassas sağlık, hukuki veya kişisel bilgi başlıklara yazılmamalıdır. Bu bot erişilebilir bir metin sırası sağlar; bütün istemciler ve yardımcı teknolojilerde uygunluk testi yapılmış değildir.

### Sorun giderme

- **`node` veya `npm` bulunamadı:** Node.js 24 kurun; yeni terminal açın. `node --version` ve `npm --version` deneyin. Windows'ta PowerShell script engeli varsa `setup.cmd` kullanın veya `npm.cmd` çalıştırın; güvenlik ilkesini gevşetmeniz gerekmez.
- **`Setup incomplete / Kurulum eksik`:** Yukarıdaki kurulum adımlarını uygulayın. `.env` olmadan bot güvenli biçimde hata kodu 1 ile durur. Tokenı loglara yapıştırmayın.
- **Kayıt/giriş başarısız:** Doğru uygulamanın Bot tokenını kullandığınızı, Application ID ile Server ID'nin yer değiştirmediğini ve botu sunucuya davet ettiğinizi kontrol edin. Public Key/Client Secret token değildir. Interactions Endpoint URL boş, ayrıcalıklı intentler kapalı olmalı.
- **`/turnqueue` görünmüyor:** Botun doğru sunucuya kurulmasını, `npm run register` başarısını ve kullanıcının Sunucuyu Yönet + Use Application Commands izinlerini kontrol edin; Discord istemcisini yeniden açın. Komut yalnızca kaydedilen sunucuda görünür.
- **Kanal izin hatası:** Normal metin kanalı kullanın. Kanalın rol geçersiz kılmalarında bot ve kullanıcı için View Channel/Send Messages açık olsun. Yetkililere Manage Server verin; bot için Administrator vermeyin.
- **Sıra zaten var:** Önce paneli Kapat ile kapatın. Panel elle silinmişse botu yeniden başlatıp eski kalan panelleri elle silin; bütün etkin sıraların sıfırlanacağını bilin.
- **Süre doldu / başka güncelleme sürüyor:** Yeniden başlatılmış veya 24 saati geçmiş paneli silip yetkiliyle yeni sıra açın. Meşgul yanıtında bir saniye sonra tekrar deneyin. Yeni yayınlar için 60 saniyelik sınırı bekleyin.
- **Discord işlemi tamamlayamadı:** Bağlantı ve izinleri düzeltin; önizleme hâlâ görünüyorsa yeniden onaylayın. Panel oluşmuşsa yeniden yayınlamak yerine onu kullanın. Ağ bağlantısı koparken Discord'un isteği alıp almadığı belirsiz kalabilir; kanalı kontrol etmeden çoklu deneme yapmayın.

### Testler, katkı ve lisans

Geliştirme kontrollerini `.env` içermeyen temiz kaynak kopyasında çalıştırın:

```sh
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
```

`check`; Biome lint/biçim kontrolü, strict TypeScript derlemesi, Node testleri, kilitli paketlerin lisans/kaynak/bütünlük incelemesi ve kaynakta sınırlı gizli bilgi kalıbı taraması yapar. Testler FIFO, kapasite, rol kaybı, önizleme sınırları, süre dolması, paralel tıklamalar ve başarısız Discord isteklerini taklit eder. Bunlar gerçek Discord sunucu testi veya kapsamlı güvenlik denetimi değildir. CI üç işletim sisteminde aynı kontrolleri ve npm audit'i çalıştırır; kaynaklar değişmemiş olmalıdır. Audit sonucu zamanla değişebilir. Tarama bir sırrın kesinlikle bulunmadığını kanıtlamaz.

Katkı için issue veya PR açın; değişiklik amacını, davranışı ve test sonucunu yazın. Token, `.env`, gerçek kullanıcı listesi veya hassas log eklemeyin. Yetki azaltma, açıklık ve güvenli hata davranışını koruyun. [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), [LICENSE](LICENSE) ve [DEPENDENCIES.md](DEPENDENCIES.md) dosyalarına bakın. Kod MIT lisanslıdır; kurulan bağımlılıklar kendi lisanslarını taşır.

## English

### Purpose and features

TurnLoom keeps a voluntary speaking order in one Discord message. A member with **Manage Server** runs `/turnqueue`, reviews a private preview, then explicitly publishes. Members use **Join** and **Leave**; managers use **Next speaker**, **Pause / resume**, and **Close**. Pausing blocks new joins while allowing departures. Advancing an empty queue preserves the current speaker. A departing speaker does not automatically advance the queue.

The bot does not connect to voice, mute/unmute people, move members, record audio, read message content or member history, enforce speaking time, verify who is speaking, or automatically moderate. Organizers apply community rules themselves. Queue membership is public in the channel; participation is not anonymous.

### Requirements

Use Windows, macOS or Linux with [Node.js 24 LTS](https://nodejs.org/en/download) and npm. Reopen your terminal after installation; `node --version` should start with `v24`. You need a Discord account, a test server where you can install bots, and **Manage Server** for organizers. The host needs Internet access to HTTPS and the Discord Gateway for as long as the bot runs. No paid service or additional API key is required. Follow the [Discord Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy) and [Developer Terms](https://discord.com/developers/docs/policies-and-agreements/developer-terms-of-service).

### Installation: Developer Portal to running bot

1. Open [Developer Portal](https://discord.com/developers/applications), choose **New Application**, and name it. Copy **General Information → Application ID**, not Public Key or Client Secret.
2. Under **Bot**, create the bot user if needed and use **Reset Token**. Keep the token private; paste it only into the local setup prompt. Never post it to GitHub, support chats or screenshots. Reset a leaked token immediately in the Portal.
3. Leave **Message Content**, **Server Members**, and **Presence** privileged intents disabled. The code uses only the non-privileged `Guilds` intent. Leave **Interactions Endpoint URL** blank: this bot receives interactions over the Gateway.
4. Under **Installation**, choose **Guild Install**, with scopes **bot** and **applications.commands**. Select only **View Channels** and **Send Messages** permissions. Do not select Administrator. Open the Portal's Install Link, choose your test server, and authorize. The invite permission number should be `3072`. User Install is unnecessary; Portal labels may change, but scopes and permissions are the same.
5. In Discord, enable **User Settings → Advanced → Developer Mode**. Right-click the server icon and **Copy Server ID**. Do not use a channel ID.
6. Download this repository using **Code → Download ZIP** and extract it to a private folder you own. Do not run from inside the archive. Avoid shared, public or automatically synced folders because setup will create a token file. No source code editing is required.
7. On Windows, open `setup.cmd`. On macOS/Linux, open a terminal in the extracted folder and run `bash setup.sh`. This installs locked dependencies, builds TypeScript, prompts for the token without displaying it, asks for the application/server IDs, creates a private `.env` file, and registers the command. Paste the token and press Enter; no characters or stars appear.
8. On Windows, open `start.cmd`; on macOS/Linux, run `bash start.sh`. Wait for **TurnLoom online / çevrimiçi** and leave the terminal open. Try `/turnqueue` in a regular server text channel.

The equivalent manual commands are `npm ci --ignore-scripts`, `npm run build`, `npm run setup`, `npm run register`, then `npm start`, in that order from this folder.

### Configuration and continuous hosting

Setup stores `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, and `DISCORD_GUILD_ID` in `.env`. The application ID must match the token's bot; the guild ID selects where to register the server command. `.env` is Git-ignored. POSIX files are created with mode `0600`; on Windows restrict folder access through your operating system account. Backups and sync services may still copy your token.

Setup refuses to overwrite an existing `.env`. To change a token, stop the bot, privately delete your `.env`, then run `npm run setup`. If the application or server changes, run `npm run register` again. No source edits are needed. For another server, invite the bot there and register using that server ID; commands registered in previous servers are not automatically removed. Registration upserts this named command without bulk-deleting other commands in the application.

The bot goes offline when the computer sleeps, the terminal closes or the network fails. For continuous operation use a trusted host and exactly **one** process running `npm start` from this folder. Your host's secret environment store can provide the same three variables instead of `.env`; `npm start` accepts an absent `.env`. Static website hosting cannot run a Gateway bot. This repository does not provision a VDS, modify existing services, or deploy automatically. Every restart resets active queues; an automatic process restart does not provide persistence.

### Usage and first trial

1. As a member with **Manage Server**, run `/turnqueue topic:Community discussion language:en` in a regular text channel. `language:tr` selects Turkish; English is the default. Use a plain 1–100 character topic without mentions, links or Markdown formatting.
2. Review the private preview and data notice. **Cancel** publishes nothing. **Publish** sends the panel to the same channel. Previews expire after ten minutes and are bound to the initiating member, server and channel. Publication rechecks permissions.
3. As a regular member, press **Join**; repeat with a second member. Only the clicking user's ID is added. Duplicate joins and joining while already speaking are rejected. **Leave** removes only yourself, including if you are currently speaking.
4. A manager presses **Next speaker** for first-in, first-out advancement. The previous speaker is not automatically requeued. People control their own microphones. **Pause / resume** controls new joins; **Close** clears IDs from memory, removes buttons, and allows a new queue.
5. Mentions are displayed for identification but never ping users. No automatic DMs are sent.

Limits: one active panel per server, 50 waiting members plus one speaker, one successful panel update per second, and at least 60 seconds between new publications in the same server. Overlapping clicks receive a retry message. Failed Discord edits leave in-memory queue state unchanged. The process holds at most 1,000 active server panels and 1,000 drafts. Limits are not coordinated across processes; do not run multiple copies with the same token.

### Permissions

The bot needs only **View Channel (1024)** and **Send Messages (2048)**. It does not request Administrator, Manage Messages, Manage Roles, Read Message History, Connect, Speak, Embed Links or privileged intents. It sends plain text panels and buttons. Organizers need **Manage Server (32)**; do not grant this permission to the bot itself. Users need channel view/send access and Use Application Commands. Channel overrides are respected; missing user or bot access stops an action. DMs, threads, forums, announcement channels and voice-channel chats are unsupported.

### Security, privacy and limits

The process stores topic, language, server/channel/message IDs, and waiting/current user IDs only in memory. Drafts also store their initiating user ID and expire after ten minutes. Active queues expire **24 hours after creation**, without sliding renewal. A minute-based sweep clears expired state within the following minute. Leaving, closing or restarting clears the relevant participant state. Discord resolves displayed mentions; the bot does not archive names, messages or history. There is no telemetry, database, on-disk queue storage or external analytics. Hosting/system logs remain the operator's responsibility; application errors omit tokens and raw Discord error payloads.

**Discord messages are separate data copies.** Everyone with access to the channel can see membership. Leaving or closing updates the panel; expiry and restart do not automatically edit or delete old messages. Old user IDs may remain in those messages. Managers should manually delete panels that are no longer needed. Stale buttons cannot change a new queue. Discord's own retention is outside this bot's control. Do not put sensitive medical, legal or personal information in topics. The text-based workflow can help structure discussions, but compatibility with every client and assistive technology has not been tested.

### Troubleshooting

- **Node/npm not found:** Install Node.js 24 and reopen the terminal. On Windows, use the `.cmd` helper or `npm.cmd` if PowerShell blocks npm scripts; no policy relaxation is required.
- **Setup incomplete:** Run setup. Without valid configuration the bot exits safely with code 1. Do not paste tokens into logs.
- **Registration/login fails:** Check that you used a Bot token, the matching Application ID, a server ID rather than a channel ID, and installed the bot in that server. Public Key and Client Secret are not tokens. Leave the Interactions Endpoint URL empty and privileged intents disabled.
- **Command missing:** Check the server installation, successful `npm run register`, and the user's Manage Server and Use Application Commands permissions. Reopen Discord. This is a server command, visible only where registered.
- **Channel permission error:** Use a regular text channel. Verify bot and member View Channel/Send Messages overrides and organizer Manage Server permissions. Do not give the bot Administrator.
- **Active queue already exists:** Close the existing panel first. If somebody deleted it manually, restart the bot and delete other old panels; all active queues reset.
- **Expired/busy panel:** Replace expired or restarted panels. Retry a busy update after one second; wait 60 seconds between publications.
- **Discord could not complete an action:** Restore permissions/connectivity and retry the preview if still available. If a public panel appeared, use it rather than publishing another. A network timeout can leave delivery uncertain; inspect the channel before retrying repeatedly.

### Tests, contribution and license

From a clean source checkout without `.env`, run `npm ci --ignore-scripts`, `npm run check`, and `npm audit --audit-level=low`. `check` runs Biome lint/format verification, strict TypeScript compilation, Node tests, license/source/integrity checks for locked packages, and limited credential-pattern scanning. Tests simulate FIFO order, capacity, revoked permissions, preview binding, expiry, overlapping clicks and failed Discord operations. They are not live Discord integration tests or a comprehensive security audit. CI runs those checks and npm audit on Windows/macOS/Linux with read-only permissions and pinned actions; the source must remain unchanged. Audit results can change over time. Pattern scanning cannot prove the absence of secrets.

Contributions should explain the behavior change and checks performed. Never attach tokens, `.env`, real participant lists or sensitive logs. Preserve narrow permissions and clear errors. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Source is under [MIT](LICENSE); separately installed dependencies retain their own licenses, listed in [DEPENDENCIES.md](DEPENDENCIES.md).

## Official API references / Resmî API kaynakları

- [Interactions and Gateway delivery](https://docs.discord.com/developers/interactions/receiving-and-responding)
- [Application commands](https://docs.discord.com/developers/interactions/application-commands)
- [Permission flags and channel overrides](https://docs.discord.com/developers/topics/permissions)
- [Discord Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy)

Implementation references reviewed on 2026-10-13. Hosting, token ownership and responsible operation remain with the server operator.
