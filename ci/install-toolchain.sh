#!/bin/sh
# Pinned Node 24.21.0 (checksum-verified) and pnpm 12.8.1, shared by CI and ci/Containerfile.
set -eu
arch="$(uname -m)"
case "$arch" in aarch64) arch=arm64 ;; x86_64) arch=x64 ;; *) exit 1 ;; esac
cd /tmp
archive="node-v24.21.0-linux-$arch.tar.gz"
curl -fsSLO "https://nodejs.org/dist/v24.21.0/$archive"
curl -fsSLo SHASUMS256.txt https://nodejs.org/dist/v24.21.0/SHASUMS256.txt
grep " $archive$" SHASUMS256.txt | sha256sum -c -
mkdir -p /opt/pinned-node
tar -xzf "$archive" -C /opt/pinned-node --strip-components=1
rm "$archive" SHASUMS256.txt
ln -sf /opt/pinned-node/bin/node /opt/pinned-node/bin/npm /opt/pinned-node/bin/npx /usr/local/bin/
npm install --global pnpm@12.8.1
ln -sf /opt/pinned-node/bin/pnpm /usr/local/bin/pnpm
