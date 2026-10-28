#!/usr/bin/env bash
# Check a deployed (or `wrangler dev`) jscebu.org against the v1 spec: old Notion-era URLs
# redirect per §5, pages return 200, brand.md keeps its agent-facing headers, misses 404.
# Usage: scripts/url-matrix.sh https://www.jscebu.org
set -uo pipefail

base=${1:?usage: url-matrix.sh BASE_URL}
base=${base%/}
host=$(printf '%s' "$base" | sed -E 's#^https?://([^/]+).*#\1#')
fail=0

# fetch PATH → sets status, location (host-relative when on the same host) and headers
fetch() {
  headers=$(curl -s -o /dev/null -D - --max-time 30 "$base$1" | tr -d '\r')
  status=$(printf '%s\n' "$headers" | head -1 | awk '{print $2}')
  location=$(printf '%s\n' "$headers" | grep -i '^location:' | head -1 | sed -E 's/^[Ll]ocation: *//; s#^https?://'"$host"'##')
}

report() { # ok? label detail
  if [ "$1" = ok ]; then printf 'ok    %s\n' "$2"; else printf 'FAIL  %s  (%s)\n' "$2" "$3"; fail=1; fi
}

redirect() { # path target status
  fetch "$1"
  if [ "$status" = "$3" ] && [ "$location" = "$2" ]; then report ok "$1 → $3 $2"
  else report fail "$1 → $3 $2" "got $status ${location:-no location}"; fi
}

page() { # path [content-type prefix]
  fetch "$1"
  local type
  type=$(printf '%s\n' "$headers" | grep -i '^content-type:' | head -1 | sed -E 's/^[Cc]ontent-[Tt]ype: *//')
  if [ "$status" = 200 ] && [[ "$type" == ${2:-}* ]]; then report ok "$1 200 ${type}"
  else report fail "$1 200 ${2:-}" "got $status $type"; fi
}

redirect /mission-vision /about/ 301
redirect /members /about/#organizers 301
redirect /iniatives /about/ 301
redirect /initiatives /about/ 301
redirect /official-links /links/ 301
redirect /community-projects /projects/ 301
redirect /events /#events 302
redirect /promotional-materials /brand/ 301
redirect /annual-hacktoberfest https://hacktoberfest.jscebu.org/ 301
redirect /volunteers-training-workshop /about/ 301

for p in / /projects/ /about/ /links/ /brand/; do page "$p" text/html; done
page /brand.md 'text/markdown; charset=utf-8'
if printf '%s\n' "$headers" | grep -qi '^access-control-allow-origin: \*'; then report ok '/brand.md CORS *'; else report fail '/brand.md CORS *' 'header missing'; fi
page /llms.txt 'text/plain; charset=utf-8'
page /brand/tokens.css text/css
page /brand/logo/sticker.svg image/svg+xml
page /sitemap.xml application/xml
page /robots.txt text/plain

fetch /this-page-does-not-exist
if [ "$status" = 404 ]; then report ok '/this-page-does-not-exist 404'; else report fail '/this-page-does-not-exist 404' "got $status"; fi

exit $fail
