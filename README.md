# TypingRealm

This is a analytics and training tool to gather statistics and improve your typing. In future, more gaming elements will be added to it until it's a full-fledged game. But the first iteration of this project is simple: gather statistics on typing for future learning and improvement.

## Deploying the project locally

Just run in the root folder

```
docker-compose -f docker-compose-production.yml up --build
```

As of now, this file runs the project in localhost configuration (not the production configuration).

You can then access the web page at:

```
https://localhost
```

and APIs at:

```
https://api.localhost/xxx
```

Read `Caddyfile` for detailed reverse proxy mappings for different APIs.
