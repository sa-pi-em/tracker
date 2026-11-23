# Supabase account sync

The app remains a static GitHub Pages site. Supabase adds optional email/password accounts and stores each account's study data in a private row. The tracker also keeps a local browser copy.

## Completed

- Supabase project created in the South Asia (Mumbai) region.
- `supabase/schema.sql` applied successfully. The `study_data` table has row-level security policies that restrict each row to its signed-in owner.
- `backend-config.js` contains this project's URL and public publishable key. It must never contain a service-role or secret key.

## Finish setup

1. In Supabase, open **Authentication → URL Configuration**. Set **Site URL** to `https://sa-pi-em.github.io/tracker/` and add that exact URL to the allowed redirect URLs. The current Site URL is `http://localhost:3000`, so account-confirmation emails need this change before signup.
2. Open the [live tracker](https://sa-pi-em.github.io/tracker/), choose **Connect**, create an account, confirm the email, and sign in.

## Existing progress

On the first sign-in, local tracker data is merged with the account's cloud record: completed level checkmarks are retained, study sessions are combined by ID, custom wheel topics are combined, and saved cloud exam dates take precedence. Once synced, the account can be used on another device.

## Security

The publishable key is intended for browser use. Row-level security protects the database table. Do not remove those policies or put a service-role/secret key in this site or its GitHub repository. Local browser saving remains available if cloud sync is unavailable.
