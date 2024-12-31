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

![Supabase - Create Entries Table](https://github.com/user-attachments/assets/5ba5386a-a172-40e3-96e7-d39d206162be)

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
- Add the following column (by clicking **Add column**):

| Name            | Type   | Default Value
| --------------- | ------ | --- |
| avatar_filename | text   | (leave empty) |

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

#### Replace Supabase URL in avatarUrl

- Go to **storeSettings.js** > **getAvatarUrl()**
- Replace the start of the URL here with your Supabase URL:
```
profile.avatarUrl = `https://wewdmqlweyvgfayimpwy.supabase.co/storage/v1/object/public/avatars/${ storeAuth.userDetails.id }/${ avatarFilename }`
```

### Add Supabase Config to Moneyballs

- On the left, click **Home**
- Scroll down to **Connecting to your new project**
- Copy the **Project URL** and the **API Key**:

![Supabase - Config](https://github.com/user-attachments/assets/a5ec2303-a7ca-4f68-8810-1f641d6a0b39)

- Open the file `/quasar.config.js`
- Find the `build > env` section
- Replace the **SUPABASE_URL** value with your **Project URL**
- Replace the **SUPABASE_ANON_KEY** value with your **API Key**:

```
build: {
  env: {
    SUPABASE_URL: 'https://ymharbyqitxhyxzuagys.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltaGFyYnlxaXR4aHl4enVhZ3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwMTg5MzQsImV4cCI6MjA0NzU5NDkzNH0.qqkzOtHSV_-zuGswNRaF1O4ibm-0tzxvd6yJMru2RG0'
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