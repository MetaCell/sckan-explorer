#!/bin/sh

DEST_FILES=$1

for var in $(printenv | grep VITE_ | awk -F= '{print $1}'); do
  sed -i 's|import.meta.env.'$var'|"'$(printenv $var)'"|g' "$DEST_FILES"
done
