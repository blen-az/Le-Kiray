# Cloudinary Setup Instructions

## Current Configuration

- **Cloud Name:** `dk8e7zkrf`
- **Upload Preset:** `lekiray` (use this for unsigned uploads)
- **API Key:** `758697318951346`

## How to Set Up the Upload Preset

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Navigate to **Settings** → **Upload**
3. Look for "Upload presets" section
4. Either use your existing `le'kiray` preset OR create a new one called `lekiray`

### Preset Configuration Required:
- **Signing Mode:** Unsigned (allows browser uploads without API secret)
- **Folder:** `lekiray` (optional, for organization)
- **Use filename:** Optional
- **Overwrite:** false (safer)
- **Use asset folder as public ID prefix:** false

## If the Preset Doesn't Exist

1. Click "Add upload preset"
2. Set name to: `lekiray`
3. Set Signing Mode to: **Unsigned**
4. Save

## Testing the Upload

After setup, try uploading an image through the "Add New Vehicle" form. The image should:
1. Show a progress bar
2. Upload to Cloudinary
3. Display in the image grid

## Troubleshooting

**Error: "Upload failed"**
- Check that the upload preset name matches exactly
- Verify it's set to "Unsigned" mode
- Check browser console for detailed error messages

**CORS Error:**
- This usually means the preset isn't in Unsigned mode
- Or the cloud name/preset name don't match

**File too large:**
- Maximum 10MB per file (configurable in cloudinary.ts)
- Compress images before uploading if needed
