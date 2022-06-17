# @wired-xr/host

A dockerized [Elixir](https://elixir-lang.org/) server for hosting spaces over WebSockets.

## About

Host servers act as a medium for all communication between players in a space. Players broadcast their positions and other data to the host server. The host server then broadcasts the data to all other players. Direct peer to peer communication within a space is not supported, as it exposes IPs and does not scale well. The cost of this increased privacy is a level of trust placed upon the space host, as players can easily be spoofed by a malicious server. There are plans to reduce the level of trust placed upon the space host, but this is not yet implemented.

Space hosting is similar to website hosting, anyone can run their own host server to host their spaces. A free host server is run by the team at `host.thewired.space`.

## Deployment

This folder contains a docker-compose file and nginx container for easy deployment. Just set your domain name in the `.env` file and run the following command:

```bash
docker compose up
```