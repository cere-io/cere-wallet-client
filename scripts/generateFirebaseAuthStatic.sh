#!/bin/sh

# Read more here
# https://firebase.google.com/docs/auth/web/redirect-best-practices?hl=en&authuser=0#self-host-helper-code

DIR="$(cd "$(dirname "$0")" && pwd)"

cd ${DIR}/../public/__auth && rm *

wget https://cere-wallet.firebaseapp.com/__/auth/handler
wget https://cere-wallet.firebaseapp.com/__/auth/handler.js
wget https://cere-wallet.firebaseapp.com/__/auth/experiments.js
wget https://cere-wallet.firebaseapp.com/__/auth/iframe
wget https://cere-wallet.firebaseapp.com/__/auth/iframe.js

cd -
