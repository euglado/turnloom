# Security / Güvenlik

Never include a token, `.env`, private participant list or request payload in an issue.
If a token leaks, reset it in Discord Developer Portal immediately, stop the bot,
delete the private local `.env`, and rerun setup with the new token. Remove the leaked
copy wherever it was shared; deleting a Git commit alone does not revoke a token.

For a suspected vulnerability, use GitHub's private vulnerability reporting if available
on the repository. If unavailable, open only a minimal issue asking for a private reporting
channel without exploit details or secrets. There is no guaranteed response time or
independent security certification. Operators should update dependencies and review
Discord permissions regularly.

Token veya `.env` paylaşmayın. Sızıntıda tokenı Portal'da hemen sıfırlayın, botu durdurup
özel `.env` dosyanızı silin ve kurulumu yeni tokenla tekrar çalıştırın. Paylaşılan kopyaları
da kaldırın; yalnızca Git geçmişini silmek tokenı geçersiz kılmaz. Açık bildirimi için varsa
GitHub özel güvenlik bildirimi kullanın; yoksa ayrıntı vermeden özel iletişim kanalı isteyin.
Yanıt süresi veya bağımsız güvenlik sertifikası garantisi yoktur.
