#!/bin/bash
set -e

ENV_FILE=".env"
EXAMPLE_FILE=".env.example"

if [ -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE already exists. Delete it to re-run setup."
  exit 1
fi

if [ ! -f "$EXAMPLE_FILE" ]; then
  echo "Error: $EXAMPLE_FILE not found. Cannot create $ENV_FILE."
  exit 1
fi

echo "Copying $EXAMPLE_FILE → $ENV_FILE..."
cp "$EXAMPLE_FILE" "$ENV_FILE"

generate_secret() {
  head -c 32 /dev/urandom | xxd -p -c 256
}

echo "Generating JWT_ACCESS_SECRET..."
JWT_ACCESS_SECRET=$(generate_secret)

echo "Generating JWT_REFRESH_SECRET..."
JWT_REFRESH_SECRET=$(generate_secret)

echo "Generating POSTGRES_PASSWORD..."
POSTGRES_PASSWORD=$(generate_secret)

echo ""
echo "Enter your Resend API key (https://resend.com/api-keys)."
echo "Press Enter to skip — emails will be logged to console: "
read -r RESEND_API_KEY

echo ""
echo "Updating $ENV_FILE..."
sed -i "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET|" "$ENV_FILE"
sed -i "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" "$ENV_FILE"
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" "$ENV_FILE"

if [ -n "$RESEND_API_KEY" ]; then
  sed -i "s|^RESEND_API_KEY=.*|RESEND_API_KEY=$RESEND_API_KEY|" "$ENV_FILE"
fi

echo ""
echo "Creating symlink for frontend..."
FRONTEND_ENV="apps/frontend/.env"
if [ -L "$FRONTEND_ENV" ]; then
  rm "$FRONTEND_ENV"
fi
ln -s "../.env" "$FRONTEND_ENV"
echo "  - Created symlink: $FRONTEND_ENV -> ../.env"

echo ""
echo "Creating symlink for backend..."
BACKEND_ENV="apps/backend/.env"
if [ -L "$BACKEND_ENV" ]; then
  rm "$BACKEND_ENV"
fi
ln -s "../.env" "$BACKEND_ENV"
echo "  - Created symlink: $BACKEND_ENV -> ../.env"

echo ""
echo "Done. Generated secrets:"
echo "  - JWT_ACCESS_SECRET"
echo "  - JWT_REFRESH_SECRET"
echo "  - POSTGRES_PASSWORD"
[ -z "$RESEND_API_KEY" ] && echo "  - RESEND_API_KEY (skipped — emails will print to console)"
echo ""
echo "Run: docker compose up -d"