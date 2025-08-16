#!/bin/bash

# VPS Cron Setup Script for Kulbruk
# Kjør dette scriptet på din VPS for å sette opp robuste cron jobs

echo "🚀 Setter opp Kulbruk VPS Cron Jobs..."

# Lag cron script directory
sudo mkdir -p /opt/kulbruk-cron
sudo chmod 755 /opt/kulbruk-cron

# Lag log directory
sudo mkdir -p /var/log/kulbruk-cron
sudo chmod 755 /var/log/kulbruk-cron

# Lag hovedscript for Fort gjort timeout
cat > /tmp/fort-gjort-timeout.sh << 'EOF'
#!/bin/bash

# Kulbruk Fort gjort Timeout Cron Job
# Kjører hver time for å sjekke utløpte ordrer

LOG_FILE="/var/log/kulbruk-cron/fort-gjort-timeout.log"
BASE_URL="${KULBRUK_BASE_URL:-https://kulbruk.no}"
CRON_SECRET="$KULBRUK_CRON_SECRET"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Health check function
health_check() {
    local response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X GET \
        -H "User-Agent: Kulbruk-Cron/1.0" \
        --max-time 30 \
        "$BASE_URL/api/health")
    
    local http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$http_code" -ne 200 ]; then
        log "❌ Health check failed (HTTP $http_code). Aborting cron job."
        return 1
    fi
    
    log "✅ Health check passed"
    return 0
}

# Main cron job function
run_fort_gjort_timeout() {
    log "🛡️ Starting Fort gjort timeout check..."
    
    # Health check first
    if ! health_check; then
        return 1
    fi
    
    # Run the actual cron job
    local response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X GET \
        -H "Authorization: Bearer $CRON_SECRET" \
        -H "Content-Type: application/json" \
        -H "User-Agent: Kulbruk-Cron/1.0" \
        --max-time 300 \
        "$BASE_URL/api/cron/fort-gjort-timeout")
    
    local http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    local body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    log "HTTP Status: $http_code"
    log "Response: $body"
    
    if [ "$http_code" -eq 200 ]; then
        log "✅ Fort gjort timeout completed successfully"
        
        # Parse and log results if JSON
        if echo "$body" | jq . >/dev/null 2>&1; then
            local processed=$(echo "$body" | jq -r '.processed // 0')
            local errors=$(echo "$body" | jq -r '.errors // 0')
            log "📊 Processed: $processed orders, Errors: $errors"
        fi
        
        return 0
    else
        log "❌ Fort gjort timeout failed (HTTP $http_code)"
        log "Error details: $body"
        
        # Send alert (customize this)
        # send_alert "Fort gjort timeout failed" "$body"
        
        return 1
    fi
}

# Retry logic
MAX_RETRIES=3
for i in $(seq 1 $MAX_RETRIES); do
    log "🔄 Attempt $i of $MAX_RETRIES"
    
    if run_fort_gjort_timeout; then
        log "🎉 Fort gjort timeout completed on attempt $i"
        exit 0
    else
        if [ $i -eq $MAX_RETRIES ]; then
            log "💥 Fort gjort timeout failed after $MAX_RETRIES attempts"
            exit 1
        else
            log "⏳ Waiting 60 seconds before retry..."
            sleep 60
        fi
    fi
done
EOF

# Installer script
sudo mv /tmp/fort-gjort-timeout.sh /opt/kulbruk-cron/
sudo chmod +x /opt/kulbruk-cron/fort-gjort-timeout.sh

# Lag environment file
cat > /tmp/kulbruk-cron.env << EOF
# Kulbruk Cron Environment Variables
KULBRUK_BASE_URL=https://kulbruk.no
KULBRUK_CRON_SECRET=your_cron_secret_here
EOF

sudo mv /tmp/kulbruk-cron.env /opt/kulbruk-cron/
sudo chmod 600 /opt/kulbruk-cron/kulbruk-cron.env

# Lag wrapper script som loader environment
cat > /tmp/run-fort-gjort-timeout.sh << 'EOF'
#!/bin/bash
set -a
source /opt/kulbruk-cron/kulbruk-cron.env
set +a
/opt/kulbruk-cron/fort-gjort-timeout.sh
EOF

sudo mv /tmp/run-fort-gjort-timeout.sh /opt/kulbruk-cron/
sudo chmod +x /opt/kulbruk-cron/run-fort-gjort-timeout.sh

# Lag log rotation config
cat > /tmp/kulbruk-cron-logrotate << 'EOF'
/var/log/kulbruk-cron/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        # Send signal to restart logging if needed
    endscript
}
EOF

sudo mv /tmp/kulbruk-cron-logrotate /etc/logrotate.d/kulbruk-cron

# Legg til crontab entries
echo "📅 Adding crontab entries..."

# Backup existing crontab
crontab -l > /tmp/current_crontab 2>/dev/null || touch /tmp/current_crontab

# Legg til våre cron jobs (hvis de ikke allerede eksisterer)
if ! grep -q "fort-gjort-timeout" /tmp/current_crontab; then
    cat >> /tmp/current_crontab << 'EOF'

# Kulbruk Fort gjort timeout check - hver time på minutt 15
15 * * * * /opt/kulbruk-cron/run-fort-gjort-timeout.sh

# Kulbruk backup timeout check - 2 ganger daglig
0 8,20 * * * /opt/kulbruk-cron/run-fort-gjort-timeout.sh

EOF
    
    # Installer ny crontab
    crontab /tmp/current_crontab
    echo "✅ Crontab updated"
else
    echo "ℹ️ Crontab entries already exist"
fi

# Cleanup
rm -f /tmp/current_crontab

echo "🎉 VPS Cron setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit /opt/kulbruk-cron/kulbruk-cron.env with your actual secrets"
echo "2. Test manually: sudo /opt/kulbruk-cron/run-fort-gjort-timeout.sh"
echo "3. Check logs: tail -f /var/log/kulbruk-cron/fort-gjort-timeout.log"
echo "4. Verify crontab: crontab -l"
echo ""
echo "🔧 Configuration files:"
echo "- Scripts: /opt/kulbruk-cron/"
echo "- Logs: /var/log/kulbruk-cron/"
echo "- Environment: /opt/kulbruk-cron/kulbruk-cron.env"
