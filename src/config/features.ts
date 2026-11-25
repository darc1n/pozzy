/**
 * Build-time feature switches for this fork (hu.minya.pozzy).
 *
 * SHARE_INTENT_ENABLED — "Share to Pozzy" (share sheet integration).
 *
 * The iOS side of expo-share-intent needs an App Group entitlement
 * (com.apple.security.application-groups) plus a Share Extension target. A free
 * Apple ID (Xcode "Personal Team") cannot provision App Groups, and a sideloaded
 * build with one either fails to sign or installs and then cannot read the shared
 * container. This fork is built to be signed on the phone with a free Apple ID
 * (SideStore / Sideloadly), so the feature is off.
 *
 * To turn it back on: set this to true AND re-add "expo-share-intent" to the
 * plugins array in app.json (keeping the bundle identifier), then rebuild with a
 * paid Apple Developer account.
 */
export const SHARE_INTENT_ENABLED = false;
