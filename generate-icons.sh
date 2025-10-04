#!/bin/bash

# Script to generate all required icons from a source image
# Usage: ./generate-icons.sh source-logo.png

if [ $# -eq 0 ]; then
    echo "Usage: $0 <source-image>"
    exit 1
fi

SOURCE=$1
PUBLIC_DIR="public"

echo "Generating icons from $SOURCE..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "ImageMagick is required. Install with: brew install imagemagick"
    exit 1
fi

# Favicon sizes
magick "$SOURCE" -resize 16x16 "$PUBLIC_DIR/favicon-16x16.png"
magick "$SOURCE" -resize 32x32 "$PUBLIC_DIR/favicon-32x32.png"
magick "$SOURCE" -resize 96x96 "$PUBLIC_DIR/favicon-96x96.png"
magick "$SOURCE" -resize 512x512 "$PUBLIC_DIR/favicon-512x512.png"

# Android icons
magick "$SOURCE" -resize 36x36 "$PUBLIC_DIR/android-icon-36x36.png"
magick "$SOURCE" -resize 48x48 "$PUBLIC_DIR/android-icon-48x48.png"
magick "$SOURCE" -resize 72x72 "$PUBLIC_DIR/android-icon-72x72.png"
magick "$SOURCE" -resize 96x96 "$PUBLIC_DIR/android-icon-96x96.png"
magick "$SOURCE" -resize 144x144 "$PUBLIC_DIR/android-icon-144x144.png"
magick "$SOURCE" -resize 192x192 "$PUBLIC_DIR/android-icon-192x192.png"

# Apple icons
magick "$SOURCE" -resize 57x57 "$PUBLIC_DIR/apple-icon-57x57.png"
magick "$SOURCE" -resize 60x60 "$PUBLIC_DIR/apple-icon-60x60.png"
magick "$SOURCE" -resize 72x72 "$PUBLIC_DIR/apple-icon-72x72.png"
magick "$SOURCE" -resize 76x76 "$PUBLIC_DIR/apple-icon-76x76.png"
magick "$SOURCE" -resize 114x114 "$PUBLIC_DIR/apple-icon-114x114.png"
magick "$SOURCE" -resize 120x120 "$PUBLIC_DIR/apple-icon-120x120.png"
magick "$SOURCE" -resize 144x144 "$PUBLIC_DIR/apple-icon-144x144.png"
magick "$SOURCE" -resize 152x152 "$PUBLIC_DIR/apple-icon-152x152.png"
magick "$SOURCE" -resize 180x180 "$PUBLIC_DIR/apple-icon-180x180.png"
magick "$SOURCE" -resize 180x180 "$PUBLIC_DIR/apple-icon.png"
magick "$SOURCE" -resize 180x180 "$PUBLIC_DIR/apple-icon-precomposed.png"

# Microsoft icons
magick "$SOURCE" -resize 70x70 "$PUBLIC_DIR/ms-icon-70x70.png"
magick "$SOURCE" -resize 144x144 "$PUBLIC_DIR/ms-icon-144x144.png"
magick "$SOURCE" -resize 150x150 "$PUBLIC_DIR/ms-icon-150x150.png"
magick "$SOURCE" -resize 310x310 "$PUBLIC_DIR/ms-icon-310x310.png"

echo "✅ All icons generated successfully!"
echo "📁 Icons saved to $PUBLIC_DIR/"
