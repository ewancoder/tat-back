# TypingRealm

This is a analytics and training tool to gather statistics and improve your typing. In future, more gaming elements will be added to it until it's a full-fledged game. But the first iteration of this project is simple: gather statistics on typing for future learning and improvement.

## Prerequisites

**IMPORTANT**

For the text generation feature to work, you need a working OpenAI API key configured in you secret manager (for local development) or environment variable (for deployment).

For local development, do this in the `TypingRealm.Typing.Api` project folder:

```
dotnet user-secrets set "OpenAIKey" "xxx"
```

where `xxx` is your personal OpenAI access key.

For deployment, you need to specify the `OpenAIKey` environment variable in a special `secrets.env` file in the root of the repository, that is being used by docker-compose. It is not checked in to the repository so you need to create it with the following content:

```
OpenAIKey=xxx
```

where `xxx` is your personal OpenAI access key.

## Deploying the project locally

Just run in the root folder

```
docker-compose -f docker-compose-production.yml up --build -d
```

As of now, this file runs the project in localhost configuration (not the production configuration).

You can access the web page at `https://localhost` and APIs at `https://api.localhost/...` (for example, Typing api at `https://api.localhost/typing`).

Read `Caddyfile` for detailed reverse proxy mappings for different APIs.

## Running / Debugging the project locally

If you want to run the project in Debug mode, open `backend/TypingRealm.sln` solution and run the following projects:

`TypingRealm.Typing.Api`

Then separately, run `http-server -p 4200` in `frontend/src` folder.

You can access the web page at `http://localhost:4200` and APIs at `http://localhost:5000`.

> Note that `appsettings.json` has connection strings to infrastructure resources (like Postgresql) which my default use the same ports as production (local) configuration uses. This means that you need to first start the project using docker-compose so that all resources are started, and only then run Visual Studio in debugging mode so it will be able to use those resources. Altetrnatively, you might want to tweak `appsettings.json` files to use your own versions of DBs etc.

> Note that currentyly you can access only Typing API at 5000 port because we only have one API. When we will have multiple APIs, they'll be accessible at 5001, 5002 etc ports or at some different ports, it will be listed in the documentation here.

## Helpful notes for development

To use `dbmate` to apply migrations, you can specify connection string like this:

```
dbmate --url "postgres://postgres@localhost:10132/typing?password=admin&sslmode=disable" up
```
