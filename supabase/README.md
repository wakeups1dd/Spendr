# Supabase Configuration

This directory contains Supabase configuration files, migrations, and Edge Functions for the Spendr application.

## Directory Structure

```
supabase/
├── migrations/          # Database migration SQL files
├── functions/          # Supabase Edge Functions
│   ├── parse-sms/     # SMS parsing function
│   ├── sync-transaction/ # Transaction syncing function
│   └── _shared/       # Shared utilities
├── config.toml        # Local Supabase configuration
└── README.md          # This file
```

## Setup

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

### Running Migrations

1. **Apply migrations locally:**
   ```bash
   supabase db reset
   ```

2. **Create a new migration:**
   ```bash
   supabase migration new migration_name
   ```

3. **Apply migrations to remote:**
   ```bash
   supabase db push
   ```

### Edge Functions

1. **Install Deno (required for Edge Functions):**
   - Follow instructions at: https://deno.land/

2. **Serve functions locally:**
   ```bash
   supabase functions serve
   ```

3. **Deploy a function:**
   ```bash
   supabase functions deploy parse-sms
   supabase functions deploy sync-transaction
   ```

4. **Invoke a function:**
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/parse-sms' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"smsText":"Rs.1000 debited...","userId":"user-id"}'
   ```

## Environment Variables

Edge Functions need the following environment variables (automatically provided by Supabase):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

You can also set secrets for Edge Functions:
```bash
supabase secrets set MY_SECRET_KEY=my_secret_value
```

Access secrets in functions via `Deno.env.get("MY_SECRET_KEY")`.

## Development Workflow

1. **Local Development:**
   - Start Supabase locally: `supabase start`
   - Run migrations: `supabase db reset`
   - Serve functions: `supabase functions serve`
   - Test functions locally before deploying

2. **Deploy to Production:**
   - Push migrations: `supabase db push`
   - Deploy functions: `supabase functions deploy <function-name>`
   - Monitor logs: `supabase functions logs <function-name>`

## Troubleshooting

- **Migration errors:** Check SQL syntax and ensure all dependencies are met
- **Function errors:** Check Deno logs and ensure environment variables are set
- **RLS policies:** Ensure RLS policies are correctly configured for user access


