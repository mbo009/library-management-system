#!/bin/sh

###################################################

RESOURCE_GROUP="rg_pis_lms"

FRONTEND_VM="frontend"
FRONTEND_PORT=80
FRONTEND_PRIVATE_IP="10.0.1.10"
BACKEND_PORT=8000

FRONTEND_PUBLIC_IP=$1

###################################################


echo "DEPLOYING APP....\n"

az vm run-command invoke \
    --resource-group $RESOURCE_GROUP \
    --name "$FRONTEND_VM" \
    --command-id RunShellScript \
    --scripts "@./init.sh" \
    --parameters "$FRONTEND_PUBLIC_IP" "$BACKEND_PORT"


echo "\nLIBRARY MANAGEMENT SYSTEM @ http://$FRONTEND_PUBLIC_IP:$FRONTEND_PORT\n"