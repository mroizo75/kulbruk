# Kulbruk – Cron-oppsett på VPS

Denne veiledningen beskriver hvordan du setter opp cron-kjøring av Saved Search Digest på egen VPS. Endepunktet er sikret med `CRON_SECRET` og aksepterer både HTTP-header `X-CRON-KEY` og query-parameter `cron_key`.

- Daglig digest: `GET /api/cron/saved-search-digest?period=daily`
- Ukentlig digest: `GET /api/cron/saved-search-digest?period=weekly`

Bytt ut `https://din.kulbruk.no` med ditt faktiske domene/base-URL, og legg inn hemmeligheten din sikkert.

## Alternativ A: Crontab (enkelt)

1. Åpne root-cron:
```bash
sudo crontab -e
```

2. Legg inn jobbene (anbefalt bruk av header; 30 sek tidsgrense):
```bash
# Daglig kl 06:00
0 6 * * * CRON_SECRET="<DIN_CRON_SECRET>" BASE_URL="https://din.kulbruk.no" curl -sS -m 30 -H "X-CRON-KEY: $CRON_SECRET" "$BASE_URL/api/cron/saved-search-digest?period=daily" >/dev/null

# Ukentlig mandag kl 07:00
0 7 * * 1 CRON_SECRET="<DIN_CRON_SECRET>" BASE_URL="https://din.kulbruk.no" curl -sS -m 30 -H "X-CRON-KEY: $CRON_SECRET" "$BASE_URL/api/cron/saved-search-digest?period=weekly" >/dev/null
```

3. Alternativt uten header (bruk query-param):
```bash
0 6 * * * BASE_URL="https://din.kulbruk.no" curl -sS -m 30 "$BASE_URL/api/cron/saved-search-digest?period=daily&cron_key=<DIN_CRON_SECRET>" >/dev/null
```

## Alternativ B: systemd timer (robust)

1. Lag miljøfil for hemmeligheter (ikke sjekk inn i git):
```bash
sudo mkdir -p /etc/kulbruk
printf '%s\n' 'CRON_SECRET="<DIN_CRON_SECRET>"' | sudo tee /etc/kulbruk/env >/dev/null
printf '%s\n' 'BASE_URL="https://din.kulbruk.no"' | sudo tee -a /etc/kulbruk/env >/dev/null
```

2. Opprett service og timer for daglig digest:
```ini
# /etc/systemd/system/kulbruk-saved-search-daily.service
[Unit]
Description=Kulbruk saved search digest (daily)

[Service]
Type=oneshot
EnvironmentFile=/etc/kulbruk/env
ExecStart=/usr/bin/curl -sS -m 30 -H "X-CRON-KEY: %E{CRON_SECRET}" "%E{BASE_URL}/api/cron/saved-search-digest?period=daily"
```

```ini
# /etc/systemd/system/kulbruk-saved-search-daily.timer
[Unit]
Description=Timer for Kulbruk saved search digest (daily)

[Timer]
OnCalendar=*-*-* 06:00:00
Persistent=true
Unit=kulbruk-saved-search-daily.service

[Install]
WantedBy=timers.target
```

3. Opprett service og timer for ukentlig digest:
```ini
# /etc/systemd/system/kulbruk-saved-search-weekly.service
[Unit]
Description=Kulbruk saved search digest (weekly)

[Service]
Type=oneshot
EnvironmentFile=/etc/kulbruk/env
ExecStart=/usr/bin/curl -sS -m 30 -H "X-CRON-KEY: %E{CRON_SECRET}" "%E{BASE_URL}/api/cron/saved-search-digest?period=weekly"
```

```ini
# /etc/systemd/system/kulbruk-saved-search-weekly.timer
[Unit]
Description=Timer for Kulbruk saved search digest (weekly)

[Timer]
OnCalendar=Mon *-*-* 07:00:00
Persistent=true
Unit=kulbruk-saved-search-weekly.service

[Install]
WantedBy=timers.target
```

4. Aktiver og test
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now kulbruk-saved-search-daily.timer
sudo systemctl enable --now kulbruk-saved-search-weekly.timer
sudo systemctl list-timers | grep kulbruk

# Manuell test
sudo systemctl start kulbruk-saved-search-daily.service
journalctl -u kulbruk-saved-search-daily.service --since "10 minutes ago" -n 100 -e
```

## Tips
- Hemmeligheter skal ikke sjekkes inn i repo. Bruk miljøfil eller CI-secrets.
- Endepunktet returnerer `{ ok: true, processed: N }` ved suksess.
- Sørg for at `POSTMARK_*` og `NEXT_PUBLIC_BASE_URL` er satt i miljøet for at e‑post skal sendes korrekt.

