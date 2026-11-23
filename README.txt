CLEARFEED v4 — IPHONE REELS FIX

WHY REELS STILL APPEARED
Your Home Screen app is only a dashboard. Links to Instagram from it can open in a separate iOS browser view where Safari Userscripts may not run. The dashboard cannot hide or block Reels on Instagram by itself.

HOW TO TEST RIGHT NOW (NO CODE CHANGES REQUIRED)
1. Install and enable the Userscripts Safari extension and allow www.instagram.com website access.
2. Open the Safari app itself (compass icon); go to https://www.instagram.com/direct/inbox/
3. Confirm a GREEN "ClearFeed · ... min left" badge appears on Instagram. If it does not, the filter has not loaded. Do not assume any Reels are blocked.
4. Try instagram.com/reels/ in Safari. If the extension works, it should redirect to messages.
5. If the badge is missing, in Safari check page menu > Extensions > Userscripts; verify site permission, enabled script, and correct scripts folder. Reload the page.

WHAT CHANGED IN V4
- The dashboard now includes a "Copy link for Safari" action in its launch dialog. Copy, switch to the *regular Safari app*, paste and navigate. This deliberately avoids iOS's unreliable in-app browser route.
- The in-app Open action remains a convenience but may NOT be filtered. Always verify the badge.
- Added best-effort CSS suppression for feed entries containing links to /reel/; retained direct Reel and Explore URL redirects, blocked Reel navigation anchors, and independent timers.
- Updated cache name so the published dashboard can update rather than serving old files indefinitely.

HOW TO UPDATE YOUR PUBLISHED SITE
Replace index.html, app.js, sw.js and ClearFeed.user.js from the bundle in your GitHub Pages repository. Other files can remain. On your iPhone replace the old userscript with v4 in the folder Userscripts uses (keep only one active ClearFeed script). Reload Safari Instagram and your dashboard. A Home Screen web app's cached content may need a force refresh or re-add if it stays stale.

LIMITATIONS
No web-app dashboard can modify the official Instagram app. The filter only works when actually injected on instagram.com in a browser where Userscripts is active. Instagram may change its DOM and defeat the best-effort CSS. iOS may open links in Safari View Controller rather than regular Safari. Local usage counters are not tamper-proof and may differ across domains, private mode or browsers.
