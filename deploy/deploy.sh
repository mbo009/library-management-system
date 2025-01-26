#!/bin/sh

###################################################

RESOURCE_GROUP="rg_pis_lms"
ADDRESS_PREFIX="10.0.0.0/16"
VNET_NAME="vnet1"

VM_USER="admin_1"
VM_PASSWORD="q%9Vt@65Xg>TolWX-7"
VM_IMAGE="Ubuntu2404"


FRONTEND_VM="frontend"
FRONTEND_PUBLIC_IP_NAME="public_ip_frontend"
FRONTEND_PORT=3000
FRONTEND_PRIVATE_IP="10.0.1.10"

###################################################


az group create --name $RESOURCE_GROUP --location westeurope

az network vnet create \
    --resource-group $RESOURCE_GROUP \
    --name $VNET_NAME \
    --address-prefix $ADDRESS_PREFIX


#################################################
#            Network Security Groups            #
#################################################

az network nsg create \
        --resource-group $RESOURCE_GROUP \
        --name nsg_frontend


az network nsg rule create \
        --resource-group $RESOURCE_GROUP \
        --nsg-name nsg_frontend \
        --name nsg_frontend_rule \
        --access allow \
        --protocol tcp \
        --priority 1000 \
        --source-address-prefix "*" \
        --source-port-range "*" \
        --destination-address-prefix "*" \
        --destination-port-range "22-8081"


#################################################
#                    Subnets                    #
#################################################

az network vnet subnet create \
        --resource-group $RESOURCE_GROUP \
        --vnet-name $VNET_NAME \
        --name subnet_frontend \
        --address-prefix 10.0.1.0/24 \
        --network-security-group nsg_frontend


#################################################
#                  Public IPs                   #
#################################################

az network public-ip create \
        --resource-group $RESOURCE_GROUP \
        --name $FRONTEND_PUBLIC_IP_NAME


#################################################
#                Virtual Machines               #
#################################################


az vm create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$FRONTEND_VM" \
    --subnet "subnet_frontend" \
    --nsg "nsg_frontend" \
    --public-ip-address "$FRONTEND_PUBLIC_IP_NAME" \
    --private-ip-address "$FRONTEND_PRIVATE_IP" \
    --vnet-name "$VNET_NAME" \
    --admin-username "$VM_USER" \
    --admin-password "$VM_PASSWORD" \
    --image "$VM_IMAGE"


#
# Get public ip addresses
#
FRONTEND_PUBLIC_IP=$(
    az network public-ip show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$FRONTEND_PUBLIC_IP_NAME" \
    --query "ipAddress" \
    --output tsv \
)

echo "LIBRARY MANAGEMENT SYSTEM @ http://$FRONTEND_PUBLIC_IP:$FRONTEND_PORT"


az vm run-command invoke \
    --resource-group $RESOURCE_GROUP \
    --name "$FRONTEND_VM" \
    --command-id RunShellScript \
    --scripts "@./init.sh" \
    --parameters "$FRONTEND_PUBLIC_IP" "$FRONTEND_PORT"


echo "LIBRARY MANAGEMENT SYSTEM @ http://$FRONTEND_PUBLIC_IP:$FRONTEND_PORT"