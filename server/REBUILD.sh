#!/usr/bin/env bash

cd ../client || exit

npm install

if not [ -f ".env" ]; then
  echo ".env file not found!"
  exit
fi

npx expo export --platform web
cp -r dist ../server/dist