#!/usr/bin/env bash

if ! [[ -f "dist" ]]; then
  echo "removing old dist"
  rm -rf dist
fi

cd ../client || exit

rm -rf dist

npm install

if ! [[ -f ".env" ]]; then
  echo ".env file not found!"
  exit
fi

npx expo export --platform web

echo "Copying dist folder"

cp -r dist ../server/dist

echo "rebuild done!"