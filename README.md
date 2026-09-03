# CsuaIntrams

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

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

## Legacy Node tools

The old Node API scripts in `server/` are now archival only. The default dependency set no longer includes the old server stack (`express`, `mysql2`, `jsonwebtoken`, etc.).

Use the Laravel commands instead:

```powershell
php artisan intrams:create-user admin@example.com Choose-A-Strong-Password
php artisan intrams:import-legacy
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
