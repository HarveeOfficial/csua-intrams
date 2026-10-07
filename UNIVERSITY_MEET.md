# University Meet matches

This feature adds a separate University Meet results flow alongside the existing CSUA campus intramurals pages. Its records live in `university_meet_matches`; they do not use campus college standings, schedule entries, or medal calculations.

## Scoring

- `score_a` and `score_b` are the scores entered for Team A and Team B.
- The team with the higher score wins. Equal scores are reported as tied, and `0–0` is not started.
- Scores must be non-negative integers that fit the database's unsigned small-integer columns. The API calculates `winnerSide` and `winner` from the scores; administrators do not enter a winner separately.

## API and pages

| Purpose | Path | Access |
| --- | --- | --- |
| List matches | `GET /api/university-meet/matches` | Public |
| Create match | `POST /api/university-meet/matches` | `um_admin` |
| Replace match | `PUT /api/university-meet/matches/{id}` | `um_admin` |
| Delete match | `DELETE /api/university-meet/matches/{id}` | `um_admin` |
| Results page | `/university-meet` | Public |
| Entry page | `/um-admin` | `um_admin` |

The public page refreshes every 30 seconds while open. The entry page supports creating, editing, and deleting matches. The existing login form sends `um_admin` users to `/um-admin`.

For local development, an account can be created with the existing console command:

```sh
cd laravel-api
php artisan intrams:create-user um-admin@example.com 'use-a-strong-password' --role=um_admin
```

The legacy campus write routes now accept only the existing `admin` and `tm` roles. University Meet writes accept only `um_admin`. Both checks run in Laravel; Angular route guards are for navigation only.

## Local verification

```sh
cd laravel-api
php artisan migrate
php artisan test --filter=UniversityMeetMatchApiTest

cd ..
./node_modules/.bin/ngc -p tsconfig.app.json --noEmit
npm run build
```

The feature tests cover public reads, create/update/delete, score-based winners and ties, invalid scores, and role separation.

## cPanel deployment without terminal access

Before the first University Meet deployment, use cPanel File Manager to edit the deployed Laravel `.env` file at `/home/csuaparr/public_html/repositories/intrams.csuaparri.net/laravel-api/.env`. Add a new email address and a unique password of at least 12 characters:

```dotenv
UM_ADMIN_EMAIL=um-admin@example.com
UM_ADMIN_PASSWORD="replace-with-a-long-unique-password"
```

Keep these values out of Git. Use an email address that is not already assigned to a campus account. The deployment command creates the `um_admin` account once; later deployments leave its password unchanged. After the first successful deployment, `UM_ADMIN_PASSWORD` may be removed from the deployed `.env` file while `UM_ADMIN_EMAIL` stays. The UM admin can change their password from the entry page.

The `.cpanel.yml` task copies the Laravel files, installs Composer dependencies, clears cached configuration, runs the University Meet table-creation migration and then the score migration, and runs `php artisan intrams:provision-um-admin`. The chained commands stop if one fails. The score migration preserves existing team scores while removing `planned_games`. The account command refuses to change the role of an existing campus account.

In cPanel's Git Version Control **pull deployment** workflow, **Update from Remote** only fetches the commit. **Deploy HEAD Commit** runs `.cpanel.yml` and therefore performs the migration and account provisioning. [cPanel's deployment guide](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/) documents these as separate actions.

## Frontend release

The live Apache site serves Angular files from the tracked `dist/csua-intrams/browser` directory. The repository's Firebase workflow creates pull request previews; it does not publish this live site. The cPanel task copies the built frontend to `/home/csuaparr/repositories/csua-intrams-deploy/` and handles the Laravel deployment.

For this deployment path, build the frontend locally from the latest `main`, then commit the generated `dist/csua-intrams` files with the release:

```sh
npm ci
npm run build
git add -A dist/csua-intrams
```

After pushing `main`, update the cPanel-managed repository from the remote and deploy its HEAD commit. This copies the current `dist/csua-intrams/browser` assets to the configured Document Root. Check that the live site's `index.html` references the newly built `main-*.js` asset, then hard-refresh the browser to load the new hashed assets.

This implementation is scoped to one current University Meet dataset. If results need separate annual editions, add a meet/edition identifier before entering a second year's matches.
