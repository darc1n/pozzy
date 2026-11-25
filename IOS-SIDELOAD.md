# Pozzy on iPhone with a free Apple ID (SideStore / iloader)

This fork exists for one reason: install Pozzy on a personal iPhone **without** an
App Store release, a Mac, or a paid Apple Developer Program membership.

Upstream (`github.com/blanergol/pozzy`) has no iOS build at all — every release asset is
an Android APK, and CI only builds APKs. An `.ipa` can only be produced with Xcode, so
this fork builds it on a GitHub-hosted macOS runner and installs it **unsigned**; the
signing happens on the PC/phone with your own free Apple ID.

## What this fork changes

| File | Change | Why |
|---|---|---|
| `app.json` | `ios.bundleIdentifier` → `hu.minya.pozzy` | `com.pozzy.mobile` belongs to the upstream author's team; App IDs are unique across accounts, so a free team cannot claim it. |
| `app.json` | `expo-share-intent` removed from `plugins` | Needs an App Group entitlement + a Share Extension target, which a free (Personal Team) account cannot provision. |
| `src/config/features.ts` | `SHARE_INTENT_ENABLED = false` | Keeps the share-sheet handler and its provider from mounting, so the module never reads the missing App Group (`Cannot retrieve appGroupIdentifier`). |
| `App.tsx` | share-intent provider + handler behind that flag | Same, without deleting code that upstream keeps changing. |
| `.github/workflows/ios-unsigned-ipa.yml` | new | Builds an unsigned arm64 `.ipa` on `macos-latest` and uploads it as an artifact. |

Everything else is upstream, so `git pull upstream master` keeps working; re-apply the
flag if upstream moves those imports.

Checked before the first build: `npx tsc --noEmit` clean, `npx jest` 136/136.

## 1. Build the .ipa (once, and after each upstream bump)

1. Push this fork to GitHub (Actions → enable workflows on the fork if GitHub asks).
2. Actions → **Unsigned iOS IPA** → *Run workflow*.
3. Wait ~20–30 min, then download the artifact **pozzy-unsigned-ipa** → `pozzy-unsigned.ipa`.

The build is unsigned on purpose: `CODE_SIGNING_ALLOWED=NO`, packaged as
`Payload/*.app` inside a zip — exactly what a sideloading tool expects.

## 2. Install it (PC connected once)

Prerequisites on Windows (from <https://docs.sidestore.io/docs/installation/prerequisites>):

- **iTunes** — <https://www.apple.com/itunes/download/win64> (installs `usbmuxd`; the
  version from Apple is recommended, the Microsoft Store one often breaks)
- **iloader** — <https://github.com/nab138/iloader/releases/latest> (`iloader-windows-x64.msi`,
  by nab138; it is the official replacement for the old AltServer pairing dance)
- **LocalDevVPN** on the phone — <https://apps.apple.com/app/localdevvpn/id6755608044>,
  then connect it (it is required whenever SideStore installs, updates or refreshes)

Then, with the iPhone plugged in and trusted:

1. Open **iloader** → sign in with your Apple ID (case-sensitive).
2. **Install SideStore (Stable)** → this also imports the pairing file SideStore needs.
3. On the phone: Settings → General → VPN & Device Management → trust your Apple ID;
   iOS 18+ also needs Settings → Privacy & Security → **Developer Mode** → on (restarts).
4. Open **LocalDevVPN** → *Connect* → open **SideStore** → sign in with the same Apple ID.
5. In SideStore tap the *7 DAYS* counter next to SideStore itself once, to finish setup.
6. Back in iloader on the PC: **Import any IPA** → pick `pozzy-unsigned.ipa`.
   (Or, with SideStore already set up: send the .ipa to the phone and use
   SideStore → *My Apps* → **+** → install from Files.)
7. SideStore signs it on the device with your free account: the app appears on the
   home screen as **Pozzy**, and SideStore's *7 DAYS* counter starts for it too.

From then on the PC is not needed: open LocalDevVPN, open SideStore, tap the counter
next to Pozzy to refresh before it expires.

## 3. First launch in Pozzy

- Server URL: `https://note.minya.hu`
- Login: your Poznote username
- Password: an **app password** — in Poznote go to *Settings → App passwords* →
  create `Pozzy iPhone` → paste the `pzn_…` value. It survives password changes and
  two-factor, and can be revoked on its own.
- Profile ID: leave empty (auto-detected from the credentials).

The login is stored in the iOS Keychain (`AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`), so this
is a one-time step. The app lock (Face ID / PIN) is only a screen lock.

## Free-account limits to expect

- Apps installed this way expire after **7 days** — that is the *signature*, not the
  login. Refreshing in SideStore keeps the app and all its data.
- At most **3** sideloaded apps at a time, and **10 App IDs per 7 days** (each install
  uses one; an App ID is reused from the second install of the same bundle id on).
- Push notifications and App Groups do not work on a free team — hence no share sheet.
- If the pairing file breaks (iOS update, reset, or at random), SideStore cannot refresh
  until it is re-imported with iloader: <https://docs.sidestore.io/docs/advanced/pairing-file>
