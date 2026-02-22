#!/bin/bash
# ============================================
# Upload Carlos Photo + Deploy
# ============================================
# Put team-carlos-01.jpg in ~/Downloads first!
# ============================================

cd ~/Developer/DevShop/crhomepros || exit 1

echo ""
echo "📸 Step 1: Upload Carlos photo to Firebase Storage..."
echo ""
node scripts/upload-carlos-photo.mjs

if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️  Upload script failed. Continuing with deploy anyway..."
  echo "   You can upload manually via Firebase Console → Storage → team/"
fi

echo ""
echo "🔨 Step 2: Building..."
npx next build

echo ""
echo "🚀 Step 3: Deploying..."
vercel --prod

echo ""
echo "============================================"
echo "✅ DONE!"
echo "   Photo: https://firebasestorage.googleapis.com/v0/b/crhomepros.firebasestorage.app/o/team%2Fteam-carlos-01.jpg?alt=media"
echo "   Site:  https://crhomepros.com/about"
echo "============================================"
echo ""
read -p "Press Enter to close..."
