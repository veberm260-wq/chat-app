# Чат — деплой на costax.ru

## Что нужно
- VPS с Ubuntu (или любым Linux)
- Доступ по SSH
- Домен costax.ru указывает на IP сервера

---

## Шаг 1 — Загрузить файлы на сервер

Со своего компьютера:
```bash
scp -r chat-app/ root@IP_СЕРВЕРА:/var/www/chat
```

Или через FTP/SFTP если нет SSH — закинь папку chat-app в /var/www/chat

---

## Шаг 2 — Установить Node.js (если нет)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Шаг 3 — Запустить приложение

```bash
cd /var/www/chat
npm install
node server.js
```

Проверь: http://IP_СЕРВЕРА:3000 — должен открыться чат.

---

## Шаг 4 — Держать запущенным (pm2)

```bash
npm install -g pm2
cd /var/www/chat
pm2 start server.js --name chat
pm2 save
pm2 startup
```

Теперь приложение запускается автоматически после перезагрузки сервера.

---

## Шаг 5 — Nginx + домен costax.ru

Установить nginx:
```bash
sudo apt install nginx
```

Создать конфиг:
```bash
sudo nano /etc/nginx/sites-available/chat
```

Вставить (замени costax.ru на свой домен):
```nginx
server {
    listen 80;
    server_name costax.ru www.costax.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Включить и перезапустить:
```bash
sudo ln -s /etc/nginx/sites-available/chat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Теперь http://costax.ru открывает чат.

---

## Шаг 6 — HTTPS (бесплатный сертификат)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d costax.ru -d www.costax.ru
```

Следуй инструкциям — certbot сам настроит HTTPS. Сертификат обновляется автоматически.

После этого чат доступен на https://costax.ru

---

## Обновить приложение

```bash
cd /var/www/chat
# (загрузить новые файлы)
pm2 restart chat
```

---

## Если нет VPS

Можно задеплоить бесплатно на Railway.app:
1. Зайди на railway.app
2. New Project → Deploy from GitHub
3. Загрузи папку
4. В настройках добавь домен costax.ru
