# Firebase Storage CORS Configuration

The video validation shows a CORS error because Firebase Storage needs to be configured to allow cross-origin requests from your domain.

## The Good News

**Your video uploaded successfully!** The CORS error only affects the automatic duration detection during upload. The video will work perfectly fine during playback because ReactPlayer handles CORS differently.

## Optional: Fix CORS for Duration Detection

If you want automatic duration detection to work during upload, you need to apply the CORS configuration:

### Option 1: Using Google Cloud Console (Easiest)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `sportscoach-2a84d`
3. Navigate to **Cloud Storage** > **Buckets**
4. Click on your bucket: `sportscoach-2a84d.firebasestorage.app`
5. Click the **Permissions** tab
6. Under "Public access", make sure it's set to allow public reads
7. Go to the **Configuration** tab
8. Click **Edit CORS Configuration**
9. Paste this:

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

10. Click **Save**

### Option 2: Using gsutil Command Line

If you have Google Cloud SDK installed:

```bash
gsutil cors set cors.json gs://sportscoach-2a84d.firebasestorage.app
```

### Option 3: Using gcloud (Alternative)

```bash
gcloud storage buckets update gs://sportscoach-2a84d.firebasestorage.app --cors-file=cors.json
```

## What Changes After CORS Setup

✅ **Before:** "Could not validate video automatically" message  
✅ **After:** Shows exact video duration immediately after upload

## Current Workaround

The app currently works fine without CORS setup:
- Videos upload successfully ✅
- Videos play correctly in quizzes ✅
- Duration is set to 0 initially ⚠️
- Duration is auto-detected when video loads in player ✅
- Questions can be added at any timestamp ✅

So CORS configuration is **optional** but recommended for better UX.
