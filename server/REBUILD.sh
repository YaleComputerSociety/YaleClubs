#!/usr/bin/env bash

if [ -f "dist" ]; then
  rm -rf dist
fi

cd ../client || exit

npm install

if [ -f ".env" ]; then
  echo ".env file not found!"
  exit
fi

npx expo export --platform web
cp -r dist ../server/dist