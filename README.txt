CLEARFEED — iPHONE WEB APP + SAFARI FILTER

WHAT IS INCLUDED
index.html, style.css, app.js, manifest.webmanifest, sw.js, icon-192.png, icon-512.png
  These files make up the Home Screen web app dashboard.
ClearFeed.user.js
  Companion Safari Userscripts filter (Reels / Explore / X For You and visible-use budget).

IMPORTANT LIMITATIONS
* A Home Screen web app cannot control Instagram or X websites itself. The companion Safari Userscripts filter is essential.
* Safari extensions generally do not run within a standalone Home Screen web app. ClearFeed launches the social websites separately into Safari/the browser, where Userscripts needs to be enabled.
* Links from a standalone iOS web app may open another app or browser depending on iOS. If the Userscripts filter does not run, use the same ClearFeed dashboard through Safari directly and tap the links there.
* Website changes can break filtering. The time budget is a voluntary boundary; not a system-level lock.
* The dashboard CANNOT read time usage from Instagram or X due to website privacy restrictions. The blocker counts time independently on those domains. A budget chosen here is sent to the blocker via a one-time URL parameter when you open a site.
* The official Instagram and X apps are unaffected.

INSTALL WITH ONLY AN iPHONE
1. You need to HOST the files on an HTTPS web host; opening index.html from Files does not install this as a working web app.
2. One route: create a GitHub repository on github.com in Safari. Upload index.html, style.css, app.js, sw.js, manifest.webmanifest and both PNG icons to its root. Note that a public GitHub Pages repo makes the source files visible to others. Never upload credentials.
3. In repository Settings > Pages, select Deploy from a branch, main, /(root), Save. Wait for your published HTTPS URL (https://YOURNAME.github.io/YOURREPO/).
4. Open that HTTPS URL using Safari. Share > Add to Home Screen > Open as Web App > Add. (Options vary by iOS.)
5. Install the "Userscripts" Safari extension from the App Store. Enable it in iPhone Settings > Apps > Safari > Extensions and give it website access for instagram.com and x.com.
6. In Userscripts select a scripts folder from Files, save ClearFeed.user.js into that folder, and reload Instagram and X in Safari. Check that the script actually runs.
7. In ClearFeed set daily limits. When you launch a site, the dashboard passes its limit to the companion filter. If filtering doesn't work from the web-app icon, open ClearFeed in Safari and use it from there.
8. For stronger restrictions use iPhone Settings > Screen Time > App Limits / web site limits as an extra layer.

PRIVACY
The dashboard uses localStorage for settings, the filter uses site-local storage for counters, and no ClearFeed server receives your Instagram or X logins. Your social websites can still collect their usual data.

TESTING
This is a static web app project and its JS was syntax checked. It has NOT been tested on a physical iPhone or the current signed-in Instagram/X interfaces.
