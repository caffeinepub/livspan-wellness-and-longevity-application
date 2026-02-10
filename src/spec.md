# Specification

## Summary
**Goal:** Stabilize the initial app load, remove the LivSpan logo image from UI, and ensure users land on the Dashboard after Internet Identity login.

**Planned changes:**
- Diagnose and fix the client-side runtime error that triggers the router-level “Something went wrong” fallback on initial load, and ensure any remaining errors are logged without making the UI unusable.
- Remove/disable rendering of the LivSpan logo image (referencing `/assets/MagicEraser_251230_145221.png`) on both the login screen and the authenticated header, ensuring no broken/empty image placeholder appears.
- Update post-authentication routing so that after successful Internet Identity login the user is always redirected to the Dashboard route (`/`), even when they originally attempted to access a deep link while logged out.

**User-visible outcome:** The app no longer crashes into the router error screen on startup, the logo image is no longer shown on login or in the header, and users are consistently taken to the Dashboard immediately after logging in.
