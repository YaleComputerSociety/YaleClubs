#!/usr/bin/env bash

cd ../client || exit
npx expo export --platform web
cp -r dist ../server/dist