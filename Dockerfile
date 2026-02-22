# Basis: Playwright mit allen Browsern
FROM mcr.microsoft.com/playwright:v1.50.0-noble

# Arbeitsverzeichnis
WORKDIR /app

# Node.js 22 (bereits im Image enthalten, ggf. Update falls nötig)
# Java installieren (für Firebase Emulator) & GitHub CLI
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    curl \
    gnupg \
    ca-certificates \
    && mkdir -p -m 755 /etc/apt/keyrings \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# Abhängigkeiten kopieren
COPY package*.json ./

# Installiere Dependencies (inkl. DevDependencies für Pipeline)
RUN npm ci

# Restlicher Code wird via Mount (docker-compose oder -v) eingebunden 
# damit lokale Änderungen sofort im Container sichtbar sind ohne Rebuild.

# Standard-Befehl: Führe die Projekt-Validierung aus (WF-2)
CMD ["npx", "tsx", "scripts-new/wf-2-project-validation.ts"]
