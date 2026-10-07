# University Meet matches

This feature adds a separate University Meet results flow alongside the existing CSUA campus intramurals pages. Its records live in `university_meet_matches`; they do not use campus college standings, schedule entries, or medal calculations.

## Scoring

- `planned_games` is the number of games scheduled for a matchup.
- `games_won_a` and `games_won_b` are the games won by each team.
- The first team to `floor(planned_games / 2) + 1` wins is the winner. The API calculates `winnerSide` and `winner` from the scores; administrators do not enter a winner separately.
- With 10 planned games, 6 wins are required. A 5–5 score stays open for one tiebreak game, ending 6–5. A team may also reach 6 earlier, ending the series then.
- With 7 planned games, 4 wins are required.
- The API rejects scores above the winning threshold, scores where both teams reach it, and totals above the possible number of games.

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

The feature tests cover public reads, create/update/delete, an early finish, a 5–5 tiebreak, invalid scores, and role separation.

## cPanel deployment without terminal access

Before the first University Meet deployment, use cPanel File Manager to edit the deployed Laravel `.env` file at `/home/csuaparr/public_html/repositories/intrams.csuaparri.net/laravel-api/.env`. Add a new email address and a unique password of at least 12 characters:

```dotenv
UM_ADMIN_EMAIL=um-admin@example.com
UM_ADMIN_PASSWORD="replace-with-a-long-unique-password"
```

Keep these values out of Git. Use an email address that is not already assigned to a campus account. The deployment command creates the `um_admin` account once; later deployments leave its password unchanged. After the first successful deployment, `UM_ADMIN_PASSWORD` may be removed from the deployed `.env` file while `UM_ADMIN_EMAIL` stays. The UM admin can change their password from the entry page.

The `.cpanel.yml` task copies the Laravel files, installs Composer dependencies, clears cached configuration, runs **only the University Meet migration** with `php artisan migrate --path=database/migrations/2026_10_07_010000_create_university_meet_matches_table.php --force`, and runs `php artisan intrams:provision-um-admin`. The chained commands stop if one fails. The account command refuses to change the role of an existing campus account.

In cPanel's Git Version Control **pull deployment** workflow, **Update from Remote** only fetches the commit. **Deploy HEAD Commit** runs `.cpanel.yml` and therefore performs the migration and account provisioning. [cPanel's deployment guide](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/) documents these as separate actions.

`.cpanel.yml` does not build or deploy the Angular frontend. `firebase.json` points Firebase Hosting at `dist/csua-intrams/browser`; the GitHub pull request workflow builds and publishes a Firebase preview. Verify the production frontend release path separately before rollout. The frontend should be published after the API code and migration are live.

This implementation is scoped to one current University Meet dataset. If results need separate annual editions, add a meet/edition identifier before entering a second year's matches.
