#!/bin/bash

SECRETS_DIR=./secrets
USERNAME_FILE=username.txt
PASSWORD_FILE=password.txt

if [ ! -d "$SECRETS_DIR" ]; then
    mkdir "$SECRETS_DIR"
fi

if [ ! -f "$SECRETS_DIR/$USERNAME_FILE" ]; then
    read -p "Digite o nome do usuário do DB: " USERNAME
    touch "$SECRETS_DIR/$USERNAME_FILE"
    echo "$USERNAME" | tr -d '\n' >"$SECRETS_DIR/$USERNAME_FILE"
fi

if [ ! -f "$SECRETS_DIR/$PASSWORD_FILE" ]; then
    read -s -p "Digite a senha do usuário do DB: " PASSWORD
    echo
    touch "$SECRETS_DIR/$PASSWORD_FILE"
    echo "$PASSWORD" | tr -d '\n' >"$SECRETS_DIR/$PASSWORD_FILE"
fi