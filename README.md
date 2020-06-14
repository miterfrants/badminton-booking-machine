# Usage

- 設定
  - `./config/urls.json` 訂場地的 url
  - `./config/secrets.json` 身分證字號(id)、密碼(pwd)、sendgridApiKey
- `nvm use 13.6` 切換 node version 到 13.6
- `npm install` 安裝 node package
- `node booking.js` 啟動搶場地機器

# Docker

## Build Image

```
docker build -t badminton-booking-machine ./ --rm
```

## Run Container

```
docker run -d \
--name badminton-booking-machine \
--rm \
badminton-booking-machine
```

## Enter Container

```
docker exec -it badminton-booking-machine /bin/bash
```
