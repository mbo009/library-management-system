#!/bin/sh
set -e

FRONTEND_PUBLIC_IP="$1"
FRONTEND_PORT="$2"

################################################

sudo apt update -y

sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    git \
    software-properties-commoncurl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -sudo apt-key fingerprint 0EBFCD88sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"sudo apt-get install docker-ce docker-ce-cli containerd.io


sudo apt-get install docker-compose


git clone https://github.com/mbo009/library-management-system.git
cd library-management-system

cd ./frontend/library-management-system/

cat > .env.production << EOL
VITE_API_BASE_URL=http://$FRONTEND_PUBLIC_IP:$FRONTEND_PORT/api
EOL

cd ../../
sudo docker-compose up