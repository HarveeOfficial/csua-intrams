# CsuaIntrams

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

## MySQL database

The app now reads and writes colleges, schedules, and admin accounts through the Laravel API in `laravel-api`.

1. Start MySQL from Laragon.
2. Prepare Laravel environment:

```powershell
cd laravel-api
copy .env.example .env
php artisan key:generate
```

3. Edit `.env` database settings when needed (defaults are `127.0.0.1:3306`, `root`, empty password, database `csua_intrams`).
4. Run migrations:

```powershell
php artisan migrate
```

5. If you already have data in the legacy Node schema (`users`, `colleges`, `schedule`), import it into normalized Laravel tables:

```powershell
php artisan intrams:import-legacy
```

6. Create or update an admin account:

```powershell
php artisan intrams:create-user admin@example.com Choose-A-Strong-Password
```

7. Start the API from the project root:

```powershell
npm run api
```

8. Start Angular in another terminal:

```powershell
npm start
```

`proxy.conf.json` still points `/api` to `http://localhost:3000`, so the frontend does not need API URL changes.

### Normalized tables (Laravel)

- `intrams_users`
- `intrams_colleges`
- `intrams_sports`
- `intrams_event_categories`
- `intrams_event_definitions`
- `intrams_college_event_scores`
- `intrams_schedule_entries`
- `intrams_schedule_entry_teams`

The API keeps compatibility with existing Angular payloads while storing data in normalized relational tables.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
