#!/bin/sh
set -e

PUBLIC_IP="$1"
BACKEND_PORT="$2"

################################################

sudo apt update -y
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update -y
sudo apt install -y git docker-ce docker-compose-plugin


git clone https://github.com/mbo009/library-management-system.git
cd library-management-system
git checkout deployment-final

# Setup backend env
mv ~/.env-lms ./.env

cat >> .env << EOL

DJANGO_DEBUG=False
FRONTEND_PUBLIC_IP=$PUBLIC_IP
EOL

# Setup frontend env
cd ./frontend/library-management-system/

cat > .env.production << EOL
VITE_API_BASE_URL=http://$PUBLIC_IP:$BACKEND_PORT/api
VITE_MEDIA_BASE_URL=http://$PUBLIC_IP:$BACKEND_PORT
EOL

# Run app
cd ../../
sudo docker compose up