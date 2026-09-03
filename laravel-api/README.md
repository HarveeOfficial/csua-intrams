# CSUA Intrams Laravel API

This folder contains the Laravel backend conversion for the CSUA Intrams app.

It keeps compatibility with the existing Angular frontend API payloads while storing records in normalized MySQL tables.

## Quick start

1. Configure environment:

```powershell
copy .env.example .env
php artisan key:generate
```

2. Update database values in `.env` if needed.

3. Run migrations:

```powershell
php artisan migrate
```

4. Import old Node schema data (optional):

```powershell
php artisan intrams:import-legacy
```

5. Create admin user:

```powershell
php artisan intrams:create-user admin@example.com StrongPassword
```

6. Run the API:

```powershell
php artisan serve --host=127.0.0.1 --port=3000
```

## Normalized tables

- `intrams_users`
- `intrams_colleges`
- `intrams_sports`
- `intrams_event_categories`
- `intrams_event_definitions`
- `intrams_college_event_scores`
- `intrams_schedule_entries`
- `intrams_schedule_entry_teams`

## API endpoints

- `POST /api/auth/login`
- `GET /api/colleges`
- `POST /api/colleges` (auth)
- `GET /api/colleges/{code}`
- `PATCH /api/colleges/{code}` (auth)
- `GET /api/schedule`
- `POST /api/schedule` (auth)
- `PATCH /api/schedule/{id}` (auth)
- `DELETE /api/schedule/{id}` (auth)
