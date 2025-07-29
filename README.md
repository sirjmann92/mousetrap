# MouseTrap

_A Dockerized web interface for automating MyAnonaMouse seedbox and account management tasks._

![MouseTrap logo](frontend/src/assets/logo.svg)

## Features

- Web config for all automation parameters
- Auto-purchase (wedges, VIP, upload)
- Notifications (email, webhook)
- Status dashboard
- Designed for Docker Compose and ease of use

## Quick Start

```bash
git clone https://github.com/YOURREPO/mousetrap.git
cd mousetrap
docker-compose up --build
```

Access the web UI at [http://localhost:39842](http://localhost:39842)

## Configuration

All user settings and state are stored in the `/config` directory (mapped as a volume).

See `config/config.yaml` for example options.

## License

Private for now (not yet open source).