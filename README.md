# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Configuring MySQL access

Create a copy of `.env.example` named `.env` and fill in your MySQL connection values:

```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_database_name
```

The home page (`src/routes/+page.svelte`) calls into `src/lib/server/db.js`, which initialises a pooled MySQL connection and runs:

```sql
SELECT pplid AS id,
       Nama AS name,
       age,
       Negeri AS state,
       KodParlimen AS parliament,
       KodDUN AS dun
FROM dpi_202412
ORDER BY pplid DESC
LIMIT 25;
```

It also computes a top-five summary by state:

```sql
SELECT Negeri AS state,
       COUNT(*) AS total
FROM dpi_202412
WHERE Negeri IS NOT NULL AND Negeri <> ''
GROUP BY Negeri
ORDER BY total DESC
LIMIT 5;
```

Additional dashboard widgets aggregate across gender and age buckets:

```sql
SELECT COUNT(*) AS total,
       AVG(NULLIF(age, 0)) AS avg_age,
       SUM(CASE WHEN voters_pru15 = 1 THEN 1 ELSE 0 END) AS voters_pru15,
       SUM(CASE WHEN voters_prn15 = 1 THEN 1 ELSE 0 END) AS voters_prn15
FROM dpi_202412;
```

```sql
SELECT COALESCE(NULLIF(kodJantina, ''), 'Unknown') AS label,
       COUNT(*) AS total
FROM dpi_202412
GROUP BY label
ORDER BY total DESC;
```

```sql
SELECT SUM(CASE WHEN age BETWEEN 18 AND 29 THEN 1 ELSE 0 END) AS age_18_29,
       SUM(CASE WHEN age BETWEEN 30 AND 39 THEN 1 ELSE 0 END) AS age_30_39,
       SUM(CASE WHEN age BETWEEN 40 AND 49 THEN 1 ELSE 0 END) AS age_40_49,
       SUM(CASE WHEN age BETWEEN 50 AND 59 THEN 1 ELSE 0 END) AS age_50_59,
       SUM(CASE WHEN age >= 60 THEN 1 ELSE 0 END) AS age_60_plus
FROM dpi_202412;
```

Adjust these queries in `src/routes/+page.server.js` to match the shape of your table. The server load function runs only on the server, so your credentials remain private.
