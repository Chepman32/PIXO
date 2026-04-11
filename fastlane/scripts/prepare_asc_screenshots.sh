#!/usr/bin/env bash
# Stage screenshots for ASC upload.
#
# - iPhone: every source image is resized in two steps (1242x2715, then
#   center-cropped to 1242x2688, the ASC iPhone 6.5" required size).
# - iPad:   6 unique PNGs are copied as-is (they're already 2064x2752, the
#   iPad Pro 13" M4 resolution).
# - Output: fastlane/asc_screenshots/<asc_locale>/iPhone_65_NN.png and
#   iPad_Pro_13_NN.png — the layout `deliver` expects.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
src_root="$repo_root/fastlane/screenshots"
iphone_src="$src_root/iphone"
ipad_src="$src_root/ipad"
stage="$repo_root/fastlane/asc_screenshots"

if ! command -v sips >/dev/null 2>&1; then
  echo "error: sips not found" >&2
  exit 1
fi

# source folder name -> ASC locale code
locales=(
  "ar:ar-SA"
  "dutch:nl-NL"
  "en-GB:en-GB"
  "en-US:en-US"
  "es:es-MX"
  "french:fr-FR"
  "german:de-DE"
  "hebrew:he"
  "hindi:hi"
  "indonesian:id"
  "it:it"
  "jp:ja"
  "ko:ko"
  "polish:pl"
  "pt-BR:pt-BR"
  "thai:th"
  "turk:tr"
  "viet:vi"
  "zh:zh-Hans"
)

# iPad source file -> staged index (1-based)
ipad_files=(
  "a_digital_advertisement_features_a_realistic_ipad.png"
  "ghty.png"
  "image.png"
  "jnu.png"
  "rge.png"
  "wef.png"
)

echo "Wiping staging dir: $stage"
rm -rf "$stage"
mkdir -p "$stage"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

for entry in "${locales[@]}"; do
  src_name="${entry%%:*}"
  asc_name="${entry##*:}"
  src_dir="$iphone_src/$src_name"
  dst_dir="$stage/$asc_name"

  if [ ! -d "$src_dir" ]; then
    echo "skip: missing source dir $src_dir"
    continue
  fi

  mkdir -p "$dst_dir"
  echo "==> $src_name -> $asc_name"

  # iPhone: sorted file list, two-step resize, sequential 01..NN naming.
  idx=0
  while IFS= read -r -d '' src_file; do
    idx=$((idx + 1))
    padded=$(printf "%02d" "$idx")
    tmp_file="$tmp_dir/step1_${asc_name}_${padded}.png"
    dst_file="$dst_dir/iPhone_65_${padded}.png"

    # Step 1: uniform upscale to 1242x2715 (matches source aspect ratio).
    sips --resampleHeightWidth 2715 1242 "$src_file" \
         --out "$tmp_file" -s format png >/dev/null

    # Step 2: center-crop to 1242x2688 (13 px off top, 14 px off bottom).
    sips -c 2688 1242 "$tmp_file" --out "$dst_file" >/dev/null

    rm -f "$tmp_file"
  done < <(find "$src_dir" -maxdepth 1 -type f \
              \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) \
              -print0 | sort -z)

  echo "    iPhone: $idx file(s)"

  # iPad: copy the shared set into every locale, preserving listed order.
  ipad_idx=0
  for ipad_file in "${ipad_files[@]}"; do
    ipad_src_path="$ipad_src/$ipad_file"
    if [ ! -f "$ipad_src_path" ]; then
      echo "    skip missing iPad file: $ipad_file"
      continue
    fi
    ipad_idx=$((ipad_idx + 1))
    padded=$(printf "%02d" "$ipad_idx")
    cp "$ipad_src_path" "$dst_dir/iPad_Pro_13_${padded}.png"
  done
  echo "    iPad:   $ipad_idx file(s)"
done

echo "Done. Staged at: $stage"
