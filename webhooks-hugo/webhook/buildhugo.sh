#!/bin/sh
set -xe

cd /tmp/build
rm -rf ./*

# clone and build
git clone --recursive https://github.com/RPGLibrarium/web.git web
cd web
HUGO_ENV=production hugo

# copy to target filesystem
dir="site.$(date -Iseconds)"
cp -r public /target/"$dir"

# change symlink
cd /target
ln -sfn ./"$dir" ./site

# cleanup -> 2 days or older may be deleted!
find . -maxdepth 1 -mindepth 1 -type d -mtime +2 -exec rm -rf "{}" \;
