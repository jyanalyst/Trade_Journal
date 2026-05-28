# Deploy Guide — SGX Trade Journal

This turns the app into a live website you can open on your phone and laptop, with
your data saved in the cloud (Supabase) so it survives browser clears and syncs
across devices.

Follow the steps in order. Every command is copy-paste. You only do the full setup
once; after that, deploys are automatic when you push to GitHub.

---

## Step 0 — Install Node.js (one time)

Node.js is the engine that runs the app.

1. Go to **https://nodejs.org**
2. Download the **LTS** version, run the installer, accept all defaults.

> You already have Node installed (v24). To confirm, you can run `node -v` in a
> terminal — if it prints a version number, skip ahead.

---

## Step 1 — Open a terminal in the project folder

1. Open **File Explorer** and navigate to:
   `C:\Users\User\github\Trade_Journal`
2. **Right-click** an empty area inside the folder → **"Open in Terminal"**
   (on Windows 11). A black/blue command window opens, already pointing at the folder.

You will type all the commands below into this window.

---

## Step 2 — Install dependencies

```powershell
npm install
```

This downloads everything the app needs into a `node_modules` folder. It takes a
minute or two the first time. Wait for it to finish (the prompt returns).

---

## Step 3 — Create your Supabase project (the cloud database)

1. Go to **https://supabase.com** → sign in (free) → **New project**.
   - Pick any name (e.g. `trade-journal`), choose a region near Singapore
     (e.g. *Southeast Asia (Singapore)*), set a database password (save it somewhere),
     and create the project. Wait ~1 minute for it to finish provisioning.

2. In the left sidebar open **SQL Editor** → **New query**, paste the SQL below,
   and click **Run**. This creates the table that stores your ideas.

```sql
create table ideas (
  id               text primary key,
  date             text,
  kill_zone        text,
  created_at       text,
  updated_at       text,
  status           text default 'watching',
  ticker           text,
  direction        text default 'long',
  catalyst         boolean default false,
  signal_1hr       boolean,
  lower_tf_signal  text,
  poc_confirm      boolean,
  entry            text,
  stop             text,
  weekly_ctx       text,
  daily_ctx        text,
  mthly_ctx        text,
  gates            jsonb default '{"G1":false,"G2":false,"G3":false,"G4":false}',
  risk_factors     jsonb default '{"pwhl":false,"orb":false}',
  observation      text,
  executed_at      text
);

-- Single-user app, no login. Allow the public anon key to read/write this table.
alter table ideas enable row level security;

create policy "anon full access" on ideas
  for all
  to anon
  using (true)
  with check (true);
```

3. In the left sidebar open **Project Settings** (gear icon) → **API**. Copy these
   two values — you'll paste them in the next step:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

> **Why the RLS policy?** Supabase blocks all access by default. This app has no
> login, so we allow the public anon key full access to the `ideas` table. That's
> appropriate for a private, single-user journal. Anyone with your URL + anon key
> could read/write the table, so don't share them publicly.

---

## Step 4 — Add your credentials

1. In the project folder, open the file **`.env.local`** in any text editor
   (it's already created with placeholders).
2. Replace the two placeholder values with the ones you copied from Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... (your long anon key)
```

3. Save the file.

> If you skip this step the app still runs, but data is kept only in memory and is
> lost on refresh. Filling these in turns on cloud saving.

---

## Step 5 — Run it on your computer

```powershell
npm run dev
```

Then open **http://localhost:3000** in your browser. You should see the **Session
Board**. Try it:

- Click **+** on a kill zone → add an idea → fill ticker/entry/stop → close the panel.
- **Refresh the page** — your idea should still be there (that confirms cloud saving works).

Press **Ctrl + C** in the terminal to stop the local server when you're done.

---

## Step 6 — Put the code on GitHub

This folder isn't a git repository yet, and your GitHub repo
(`https://github.com/jyanalyst/Trade_Journal`) is currently empty. Run these
commands once, in the same terminal:

```powershell
git init
git add .
git commit -m "Add Next.js scaffold and Supabase integration"
git branch -M main
git remote add origin https://github.com/jyanalyst/Trade_Journal.git
git push -u origin main
```

> If git asks you to log in, a browser window will open — sign in to GitHub and
> approve. Your `.env.local` is **not** uploaded (it's git-ignored), so your
> credentials stay private.

For future changes, you only need:

```powershell
git add .
git commit -m "describe your change"
git push
```

---

## Step 7 — Deploy to Vercel (the live website)

1. Go to **https://vercel.com** → sign in with your GitHub account.
2. **Add New… → Project** → **Import** the `Trade_Journal` repository.
3. Framework is auto-detected as **Next.js** — leave the defaults.
4. Expand **Environment Variables** and add the same two values from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy** and wait ~1 minute.

Every future `git push` to `main` will automatically redeploy.

---

## Step 8 — Open it on your phone

1. Vercel shows your live URL (e.g. `https://trade-journal-xxx.vercel.app`).
2. On your **iPhone**, open that URL in **Safari** → tap the **Share** button →
   **Add to Home Screen** → name it **SGX Journal** → **Add**.
3. Launch it from the home screen — it opens full-screen, like a real app
   (no browser bars).

On Android/Chrome it's similar: menu → **Add to Home screen / Install app**.

---

## Quick verification checklist

After deploying, confirm these all work on the live URL:

- [ ] Board loads: kill zones, stats bar, gates, phase selects, date picker.
- [ ] Add an idea → refresh → it persists.
- [ ] Edit an idea → Save → changes persist on refresh.
- [ ] Void an idea → it shows as **VOID** after refresh.
- [ ] Mark an idea executed → it appears under the **Executed** view.
- [ ] The ↺ reset button clears everything (and stays cleared after refresh).

---

## Replacing the app icons (optional)

The home-screen icons (`public/icon-192.png`, `public/icon-512.png`) are simple
amber placeholders with an "S". To use your own, replace those two files with PNGs
of the same sizes (192×192 and 512×512), then `git add . && git commit && git push`.

---

## Troubleshooting

- **"Add → refresh → idea disappears"**: `.env.local` (locally) or the Vercel
  environment variables (in production) are missing/wrong, or the SQL table wasn't
  created. Re-check Steps 3–4 and that the SQL ran without error.
- **`git push` rejected**: make sure the repo is empty, or run
  `git pull origin main --rebase` then push again.
- **Port 3000 already in use**: stop the other process, or run
  `npm run dev -- -p 3001` and use http://localhost:3001.
