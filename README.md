# Hidden CS

Find new posts on the counter strike blog, including hidden posts.
If you do not wish to deploy it yourself, you can find an active deployment in [this Telegram Channel](https://t.me/hiddencsposts).

## Requirements

Simple, you only need NodeJS and MongoDB.

## Run Locally

Clone the project

```bash
  git clone https://github.com/giftimie/hiddencs.git
```

Go to the project directory

```bash
  cd hiddencs
```

Install dependencies

```bash
  npm install
```

Run with

```bash
  node ./index.js
```

## How to deploy

As you may have seen, the project does not include any execution loop / timer. This is because it's thought to be configured externally as the user wishes, for example as a cronjob.

In this example, I will show you how to configure a [systemd timer](https://manpages.ubuntu.com/manpages/bionic/man5/systemd.timer.5.html).

First, create the service.

```bash
sudo nano /etc/systemd/system/hiddencs.service
```

```bash
[Unit]
Description=Finds new Counter-Strike blog posts.
Wants=hiddencs.timer

[Service]
WorkingDirectory=/opt/hiddencs
ExecStart=node /opt/hiddencs/index.js

```

Then create the timer.

```bash
sudo nano /etc/systemd/system/hiddencs.timer
```

```bash
[Unit]
Description=Run hiddencs every 10 minutes

[Timer]
OnBootSec=30
OnCalendar=*:0/10
AccuracySec=1ms

[Install]
WantedBy=timers.target
```

Finally, restart the daemon...

```bash
sudo systemctl daemon-reload
```

Check if the timer is working by executing

```bash
sudo systemctl status hiddencs.timer
```

You should see something like the following.

![Timer status, showing 7 minutes left until the next execution](https://i.imgur.com/gdGKxvn.png)

## Environment Variables

Copy the content of `.env.local` to `.env`
Complete the DB and Telegram section according to your environment.

| ENV Key              | Value                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------- |
| MONGO_DB_NAME        | Complete with an unused DB name on your MongoDB deployment                                |
| MONGO_CONNECTION_URL | [MongoDB documentation](https://www.mongodb.com/docs/manual/reference/connection-string/) |
| TELEGRAM_BOT_ID      | [Telegram Documentation](https://core.telegram.org/bots/tutorial#obtain-your-bot-token)   |
| TELEGRAM_CHAT_ID     | [Telegram Documentation](https://core.telegram.org/bots/api#getupdates)                   |

## License

[Apache 2.0](https://choosealicense.com/licenses/apache-2.0/)
