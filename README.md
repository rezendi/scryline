# Scryline

Making sense of the world.

[Scryline](https://scryline.com/) is a service for hosting and creating annotated timelines, which enable us to summarize and make sense of complex subjects and, crucially, see how our understanding of those subjects has changed over time. See the [Manifesto](./MANIFESTO.md) for more.

It's built with Svelte, Sapper, and PostgreSQL ... but it's worth noting that its use of the database is fairly minimal; Scryline is also an example of genuinely open data, in that the timelines it generates are stored as YAML files on GitHub (either the user's, or, by default, [Scryline's own repo](https://github.com/scryline).) The databse is used to store user information and to keep a cached index of timelines, but, crucially, users maintain control of their own data, can use entirely independent services to provide different views of it, and can easily copy and fork others' public timelines. ([Nextline](https://github.com/rezendi/nextline) is an example of a different view onto the same data with no shared server, database, or dependency other than GitHub itself.)

Building and sharing timelines by hand is supported. I'm currently working on a service which will expand Scryline to generate timelines for a given search string, duration, and interval by using public news APIs.

Running it yourself should be as simple as running Postgres in a local Docker container, performing a `git pull`, populating `env.local` with the following environment variables:
- GITHUB_ACCOUNT (use `scryline` to access existing timelines)
- GITHUB_REPO (`scrylines`)
- GITHUB_TOKEN (your own, obviously)
- POSTGRES_PASSWORD (for your database)
- SESSION_SECRET (some random string)

(To log in with Twitter you'll also need TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_TOKEN_KEY and TWITTER_TOKEN_SECRET.)

