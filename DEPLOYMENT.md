# Deploying AutoGuard AI with MySQL

Yes. AutoGuard AI is designed to run as one Spring Boot application with a MySQL 8 database. This guide uses an Ubuntu server, systemd, and Nginx; the same environment variables also work on Render, Railway, AWS, Azure, or a container platform.

## Prerequisites

- A Linux server with Java 21, MySQL 8, and Nginx.
- A domain name with DNS pointing to the server (recommended).
- A Groq API key.
- At least 2 GB RAM. The first startup downloads and loads the local ONNX embedding model used by RAG.

## 1. Create the MySQL database and user

Log in to MySQL as an administrator and run:

```sql
CREATE DATABASE autoguard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'autoguard'@'localhost' IDENTIFIED BY 'use-a-long-unique-password';
GRANT ALL PRIVILEGES ON autoguard_db.* TO 'autoguard'@'localhost';
FLUSH PRIVILEGES;
```

For a managed database, create the database and user in the provider console instead. Allow the application server's IP address to connect; do not expose MySQL publicly unless the provider requires it.

## 2. Build the application

From the project directory:

```bash
./mvnw clean package -DskipTests
```

Copy `target/autoguard-ai-0.0.1-SNAPSHOT.jar` to `/opt/autoguard/autoguard-ai.jar` on the server.

## 3. Set production secrets

Create `/etc/autoguard/autoguard.env` with permissions restricted to the service account:

```properties
AUTOGUARD_DB_URL=jdbc:mysql://localhost:3306/autoguard_db?useSSL=true&serverTimezone=UTC
AUTOGUARD_DB_USERNAME=autoguard
AUTOGUARD_DB_PASSWORD=use-a-long-unique-password
AUTOGUARD_GROQ_API_KEY=your-groq-api-key
SERVER_PORT=7070
```

Do not add this file to Git. Use your cloud provider's secret manager or environment-variable controls rather than putting production secrets in source files.

## 4. Run with systemd

Create `/etc/systemd/system/autoguard.service`:

```ini
[Unit]
Description=AutoGuard AI
After=network.target mysql.service

[Service]
User=autoguard
WorkingDirectory=/opt/autoguard
EnvironmentFile=/etc/autoguard/autoguard.env
ExecStart=/usr/bin/java -jar /opt/autoguard/autoguard-ai.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now autoguard
sudo systemctl status autoguard
```

Use `sudo journalctl -u autoguard -f` to inspect startup logs. Confirm that the service listens only on the expected application port before making it public.

## 5. Put Nginx in front of the app

Create an Nginx server block such as `/etc/nginx/sites-available/autoguard`:

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:7070;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it, test Nginx, and obtain a TLS certificate with Certbot. After HTTPS is working, redirect port 80 to 443.

## Production checklist

- Keep MySQL, Java, and the server patched.
- Use a dedicated MySQL user and a strong password.
- Store credentials as deployment secrets; never commit `.env`.
- Back up MySQL regularly and test a restore.
- Use HTTPS through Nginx or your cloud load balancer.
- Keep `spring.jpa.hibernate.ddl-auto=update` only for initial development-style deployment. Add Flyway migrations and change it to `validate` before production data becomes important.
- Monitor service logs, disk space, database capacity, and Groq API usage.
