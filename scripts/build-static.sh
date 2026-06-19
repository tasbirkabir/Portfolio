#!/bin/bash
# Build the static website version of Tasbir Kabir's platform.
# Produces a `out/` directory containing index.html + all assets + static JSON data.
# Upload the contents of `out/` to Hostinger shared hosting (public_html).

set -e

echo "📦 Building static website for Tasbir Kabir..."

cd "$(dirname "$0")/.."

# 1. Swap in the static export config
echo "→ Switching to static export config..."
cp next.config.ts next.config.dev.ts.bak
cp next.config.static.ts next.config.ts

# 2. Build (produces out/ directory)
echo "→ Running Next.js static export build..."
bun run build

# 3. Restore the dev config
echo "→ Restoring dev config..."
mv next.config.dev.ts.bak next.config.ts

# 4. Verify the output
if [ -d "out" ]; then
  echo ""
  echo "✅ Static build complete!"
  echo ""
  echo "   Output directory: $(pwd)/out"
  echo "   Files: $(find out -type f | wc -l)"
  echo "   Size: $(du -sh out | cut -f1)"
  echo ""
  echo "   📤 To deploy to Hostinger shared hosting:"
  echo "      1. Zip the contents of out/:  cd out && zip -r ../tasbir-kabir-static.zip . && cd .."
  echo "      2. Upload tasbir-kabir-static.zip to Hostinger File Manager → public_html"
  echo "      3. Extract the ZIP inside public_html"
  echo "      4. Visit your domain — the site is live!"
  echo ""
  echo "   The site will have:"
  echo "   ✓ Full visual design (home, about, books, resources, blog, contact)"
  echo "   ✓ Premium ebook reader (Chapter 1 free preview + paywall)"
  echo "   ✓ Multi-step project inquiry form (mailto fallback)"
  echo "   ✓ Search across all content"
  echo "   ✓ Dark/light mode"
  echo "   ✗ Admin panel (requires a Node.js server)"
  echo "   ✗ User accounts / login (requires a server)"
  echo "   ✗ Live payment processing (checkout simulates + records locally)"
else
  echo "❌ Build failed — no out/ directory produced."
  exit 1
fi
