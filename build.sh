#!/bin/bash
set -euo pipefail

# ── OhMyScroll Build Script ─────────────────────────
# Targets: Apple Silicon (arm64)
# Config:  Release (optimised)

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
XCODE_DIR="$PROJECT_DIR/OhMyScroll"
BUILD_DIR="$PROJECT_DIR/build"
APP_NAME="OhMyScroll"

echo "══════════════════════════════════════════"
echo "  🔨 Building $APP_NAME (arm64 Release)"
echo "══════════════════════════════════════════"
echo ""

# ── Step 1: Clean previous build ────────────────────
echo "→ Cleaning previous build..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# ── Step 2: Build ───────────────────────────────────
echo "→ Building..."
xcodebuild \
    -project "$XCODE_DIR/$APP_NAME.xcodeproj" \
    -scheme "$APP_NAME" \
    -configuration Release \
    -arch arm64 \
    -derivedDataPath "$BUILD_DIR/DerivedData" \
    ONLY_ACTIVE_ARCH=YES \
    ARCHS=arm64 \
    VALID_ARCHS=arm64 \
    BUILD_DIR="$BUILD_DIR/Products" \
    CODE_SIGN_IDENTITY="-" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO \
    SWIFT_OPTIMIZATION_LEVEL="-O" \
    GCC_OPTIMIZATION_LEVEL=s \
    DEPLOYMENT_POSTPROCESSING=YES \
    STRIP_INSTALLED_PRODUCT=YES \
    DEAD_CODE_STRIPPING=YES \
    2>&1 | tail -20

# ── Step 3: Locate and copy .app ────────────────────
APP_PATH=$(find "$BUILD_DIR/Products" -name "$APP_NAME.app" -type d | head -1)

if [ -z "$APP_PATH" ]; then
    echo ""
    echo "❌ Build failed — $APP_NAME.app not found"
    exit 1
fi

# Copy to project root for easy access
cp -R "$APP_PATH" "$PROJECT_DIR/$APP_NAME.app"

APP_SIZE=$(du -sh "$PROJECT_DIR/$APP_NAME.app" | cut -f1)
ARCH=$(file "$PROJECT_DIR/$APP_NAME.app/Contents/MacOS/$APP_NAME" | grep -o 'arm64' || echo "unknown")

echo ""
echo "══════════════════════════════════════════"
echo "  ✅ Build successful!"
echo "  📦 $APP_NAME.app ($APP_SIZE, $ARCH)"
echo "  📍 $PROJECT_DIR/$APP_NAME.app"
echo "══════════════════════════════════════════"
