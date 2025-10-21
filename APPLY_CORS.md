# How to Apply CORS Configuration to Firebase Storage

Your video uploaded successfully! But we need to configure CORS (Cross-Origin Resource Sharing) so that the video duration can be auto-detected during upload.

## Quick Fix (5 minutes via Google Cloud Console)

### Step 1: Go to Google Cloud Storage

1. Open: https://console.cloud.google.com/storage/browser
2. Sign in with your Google account (the one that owns the Firebase project)
3. Make sure project `sportscoach-2a84d` is selected (top dropdown)

### Step 2: Find Your Storage Bucket

You should see a bucket named: `sportscoach-2a84d.firebasestorage.app`

### Step 3: Configure CORS

1. Click the **3 dots (⋮)** menu next to the bucket name
2. Select **Edit CORS configuration**
3. A text editor will appear
4. **Delete any existing configuration** and paste this:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
  }
]
```

5. Click **Save**

### Step 4: Test It

1. Go back to your app: https://sports-goalie.vercel.app/admin/quizzes/create
2. Upload a video file
3. You should now see the exact duration instead of "Could not validate video"

---

## Alternative: Using Command Line (Advanced)

If you have `gsutil` or `gcloud` configured with authentication:

```bash
gsutil cors set cors.json gs://sportscoach-2a84d.firebasestorage.app
```

Or:

```bash
gcloud storage buckets update gs://sportscoach-2a84d.firebasestorage.app --cors-file=cors.json
```

---

## What This Does

- Allows your web app (sports-goalie.vercel.app) to read video metadata from Firebase Storage
- Enables automatic duration detection when videos are uploaded
- Does NOT affect security - storage rules still control who can upload/delete

## Important Note

**Your app works fine without this!** The CORS configuration just improves the UX by showing the video duration immediately after upload. Without it, the duration is detected during playback, which works perfectly fine.
