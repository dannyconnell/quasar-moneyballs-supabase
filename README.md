# Supabase & Vue 3 (with Quasar & Pinia)

This is the source code from the **Supabase & Vue 3 (with Quasar & Pinia)** course. Follow this guide to get the project running.

### Create Moneyballs Supabase Project

- Create a [Supabase](https://supabase.com) account
- From the Dashboard, click **New Project**
- On the **New Project** page:
  - Enter **Moneyballs** for the **Project name**
  - Generate a password (save it somewhere)
  - Choose a Region
  - Click **Create new project**:

![Supabase - Create new project](https://github.com/user-attachments/assets/e3f6b47e-41ed-4c8a-acf6-80231e114fd6)

### Setup Authentication

- Go to the Supabase dashboard
- Click on **Authentication** on the left
- Click on **Providers** 
- Ensure that **Email** is enabled
- Click on **Email** to show the dropdown options
- Ensure that **Confirm email** is **disabled**
- Click **Save**

![Setup Authentication](https://github.com/user-attachments/assets/7eae70ae-78b3-48f2-b44e-e90ab5775f2e)


### Create Entries Table

- Wait til your project is created
- On the side bar, click **Database**
- On the left, click **Tables**
- Click **New table**
- In Name, enter **entries**
- Make sure **Enable Row Level Security (RLS)** is enabled
- Enable **Enable Realtime**
- For the **id** column, change the **Type** to **uuid**
- Add the following columns (by clicking **Add column**):

| Name    | Type   | Default Value
| ------- | ------ | --- |
| name    | text   | (leave empty) |
| amount  | float4 | 0 |
| paid    | bool   | false |
| order   | int8   | 1 |
| user_id | uuid   | gen_random_uuid() |

![Supabase - Create Entries Table](https://github.com/user-attachments/assets/52effa7d-178c-4058-880f-be6ceed5cb7f)

- Click **Save**

### Create RLS Policies

- Go to **Database** > **Policies**

#### SELECT Policy

- Click on **Create policy**
- Under **Policy Command** click on **SELECT**
- Under **Templates**, scroll down & click on **SELECT - Enable users to view their own data only**
- Click on **Save Policy**

#### INSERT Policy

- Click on **Create policy**
- Under **Policy Command** click on **INSERT**
- Under **Templates**, click on **INSERT - Enable insert for users based on user_id**
- Under **Target Roles**, choose **authenticated**
- Click on **Save Policy**

#### DELETE Policy

- Click on **Create policy**
- Under **Policy Command** click on **DELETE**
- Under **Templates**, click on **DELETE - Enable delete for users based on user_id**
- Under **Target Roles**, choose **authenticated**
- Click on **Save Policy**

#### UPDATE Policy

- Click on **Create policy**
- Under **Policy Command** click on **UPDATE**
- Set **Policy name** to **Enable update for users based on user_id**
- Under **Target Roles** choose **authenticated**
- Add this line to both the **using** block AND the **with check** blocks (you can copy this from the **DELETE** policy if you edit it):

```(( SELECT auth.uid() AS uid) = user_id)```

- Click on **Save Policy**

### Stats Table

- Go to **Database** > **Tables** > **New table**
- Set the name to **stats**
- Disable **Enable Row Level Security (RLS)**
- Add the following columns (by clicking **Add column**):

| Name    | Type   | Default Value
| ------- | ------ | --- |
| name    | text   | (leave empty) |
| value   | int8   | 0 |

- Click **Save**

#### Add Row for entries_count

- Click the 3 dots next to **stats** table > **View in Table Editor**
- Click **Insert** > **Insert row**
- Set the **name** to **entries_count**
- Set the **value** to **0**
- Click **Save**

### Profiles Table

- Go to **Database** > **Tables** > **New table**
- Set the name to **profiles**
- Disable **Enable Row Level Security (RLS)**
- Set **id** type to **uuid**
- Add the following columns (by clicking **Add column**):

| Name            | Type   | Default Value
| --------------- | ------ | --- |
| avatar_filename | text   | (leave empty) |
| bio             | text   | (leave empty) |

- Click **Save**


### Create Database Function (increment_entries_count)

- Go to **Database** > **Functions**
- Click on **Create a new function**
- Set **Name of function** to **increment_entries_count**
- Set **Return type** to **trigger**
- Set **Definition** to:

```
BEGIN
  update public.stats
  set value = value + 1
  where name = 'entries_count';
  RETURN null;
END;
```

- Click **Confirm**

### Create Database Trigger (entry_inserted)

- Go to **Database** > **Triggers**
- Click **Create a new trigger**
- Set **Name of trigger** to **entry_inserted**
- Set **Table** to **entries**
- Next to **Events** check **Insert**
- Set **Trigger type** to **After the event**
- Click on **Choose a function to trigger**
- Click on our function **increment_entries_count**
- Click **Confirm**


### Create Storage Bucket (Avatars)

#### Create Bucket

- Go to **Storage** > **New bucket**
- Set **Name of bucket** to **avatars**
- Check **Public bucket**
- Click **Additional configuration**
- Set **Allowed MIME types** to **image/jpeg, image/png**
- Click **Save**

#### Create Storage Policies

- Go to **Storage** > **Policies**
- On **avatars** bucket, click **New policy**
- Click **Get started quickly**
- Choose **Give users access to only their own top level folder named as uid**
- Click **Use this template**
- Next to **Allowed operation** check all (SELECT, INSERT, UPDATE & DELETE)
- Next to **Target roles**, choose **authenticated**
- Click **Review**
- Click **Save policy**

### Deploy Edge Functions

- **IMPORTANT:** type the deploy commands in by hand & don’t copy and paste them from here (the dashes get copied incorrectly)!
- Install Supabase CLI:
```
npm install supabase —-save-dev
```
- Initialize Supabase:
```
npx supabase init
```
- Run this command to deploy the hello-world edge function (replace the project ref with yours - get this from the live dashboard URL in the address bar after **/project/**):

```
npx supabase functions deploy hello-world --project-ref wewdmqlweyvgfayimpwy
```
- Run this command to deploy the greeting edge function (replace the project ref with yours - get this from the live dashboard URL in the address bar after **/project/**):

```
npx supabase functions deploy greeting --project-ref wewdmqlweyvgfayimpwy
```

### Add Supabase Config to Moneyballs

- On the left, click **Home**
- Scroll down to **Connecting to your new project**
- Copy the **Project URL** and the **API Key**:

![Supabase - Config](https://github.com/user-attachments/assets/a5ec2303-a7ca-4f68-8810-1f641d6a0b39)

- Open the file `/quasar.config.js`
- Find the `build > env` section
- Replace the **SUPABASE_URL** values with your **local** and **live** **Project URL**s
- Replace the **SUPABASE_ANON_KEY** values with your **local** and **live** **API Keys**:

```
build: {
  env: {
    SUPABASE_URL: isLocalSupabase
      ? 'http://127.0.0.1:54321'
      : 'https://wewdmqlweyvgfayimpwy.supabase.co',
    SUPABASE_KEY: isLocalSupabase
      ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indld2RtcWx3ZXl2Z2ZheWltcHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzOTMzMzIsImV4cCI6MjA0ODk2OTMzMn0.eBdrctO6WyW1bv1KAEU9gHweojiz3ePluKPmfza2GuQ'
  },
  ...
}
```

### Install the dependencies
```bash
npm install
```

### Start the app in development mode
```bash
quasar dev
```

### Run Supabase Locally

#### Log out Live User

- In Moneyballs, if you have a live user logged in, log them out. Once you have Moneyballs working with the Local Supabase Instance, log in another user. 

#### Setup Local Supabase Instance

- [Install Docker](https://www.docker.com/) for your platform (with recommended settings)
- Open a separate terminal (from the Quasar terminal)
- Install Supabase CLI
```
npm install supabase –-save-dev
```
- Login to Supabase:
```
npx supabase login
```
- Initialise local Supabase project (choose No to options):
```
npx supabase init
```
- If you see a "file exists" error don't worry about it - Supabase is already initialized
- Start the local instance:
```
npx supabase start
```
- Open the **Studio URL** that you'll see in the teriminal
- Link local Supabase project to supabase.com project:
```
npx supabase link
```
- Select the correct project

#### Import Tables

- Generate initial structure migration file
- **IMPORTANT:** type this command in by hand & don't copy & paste it from here (the dashes get copied incorrectly)!
```
npx supabase db diff -f initial_structure –-linked
```
- You should see the migration file here:
```
/supabase/migrations/[TIMESTAMP]_initial_structure.sql
```
- Run the migration file:
```
npx supabase db reset
```

#### Import Data

- Generate the seed.sql file
- **IMPORTANT:** type this command in by hand & don't copy & paste it from here (the dashes get copied incorrectly)!
```
npx supabase db dump --data-only -f supabase/seed.sql --linked
```
- Import the data:
```
npx supabase db reset
```

#### Connect Moneyballs to Local Instance

- Start and stop Supabase:
```
npx supabase stop
npx supabase start
```
- Copy the local **API URL** and **anon key** from the terminal, e.g:

```
API URL: http://127.0.0.1:54321
...
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

- Setup local environment variables (in quasar.config.js), e.g:

```
/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const isLocalSupabase = true
```

```
    ...
    build: {
      env: {
        SUPABASE_URL: isLocalSupabase
          ? 'http://127.0.0.1:54321'
          : 'https://bngflwyejhhuvheveneb.supabase.co'
        ,
        SUPABASE_ANON_KEY: isLocalSupabase
          ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
          : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZ2Zsd3llamhodXZoZXZlbmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTI5NjcsImV4cCI6MjA0NTY4ODk2N30.4l8O1YzddSF7pAYcQkuodfp6uMJrtHuV_VTrMp1Hqk8'
      },
      ...
    }
```

#### Enable Realtime for Entries Table

- **Local dashboard** > **Database** > **Tables** > **entries**
- Click the 3 dots > **Edit table** > **Enable Realtime** > **Save**

#### Create Storage Policies

- Go to **Local dashboard** > **Storage** > **Policies**
- On **avatars** bucket, click **New policy**
- Click **Get started quickly**
- Choose **Give users access to only their own top level folder named as uid**
- Click **Use this template**
- Next to **Allowed operation** check all (SELECT, INSERT, UPDATE & DELETE)
- Next to **Target roles**, choose **authenticated**
- Click **Review**
- Click **Save policy**

#### Push Local Database Changes to Live

- **IMPORTANT:** type the following commands in by hand & don't copy & paste them from here (the dashes get copied incorrectly)!
- Generate a DIFF migration file, e.g:

```
npx supabase db diff -f added_bio_field_to_profiles_table
```

- Push the changes:
```
npx supabase db push --linked
```

- If you see an error, copy the timestamp from any migration file that has already been applied (or already exists) on live and run this to ignore this migration file when pushing:

```
npx supabase migration repair [TIMESTAMP FROM FILE] --status applied
```
- Push the changes again:
```
npx supabase db push --linked
```

#### Switch between Live & Local

- In **quasar.config.js**, set **isLocalSupabase** to **true** or false, e.g:

```
const isLocalSupabase = false // use live supabase instance
```