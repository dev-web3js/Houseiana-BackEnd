#!/bin/bash

# =============================================================================
# Houseiana Backend - Azure Deployment Script
# =============================================================================
# This script automates the complete deployment of Houseiana Backend to Azure
# Usage: ./scripts/azure-deploy.sh [environment]
# Example: ./scripts/azure-deploy.sh production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
RESOURCE_GROUP="houseiana-rg"
LOCATION="eastus"
APP_NAME="houseiana-backend-$(date +%s)"
DB_SERVER_NAME="houseiana-db-server"
KEYVAULT_NAME="houseiana-kv-$(date +%s)"
APPSERVICE_PLAN="houseiana-plan"

echo -e "${BLUE}🚀 Starting Azure deployment for Houseiana Backend${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}App Name: ${APP_NAME}${NC}"

# Function to check if Azure CLI is installed
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
        echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
}

# Function to check if user is logged in to Azure
check_azure_login() {
    if ! az account show &> /dev/null; then
        echo -e "${YELLOW}⚠️  You are not logged in to Azure. Logging in...${NC}"
        az login
    fi

    echo -e "${GREEN}✅ Azure login verified${NC}"
}

# Function to create resource group
create_resource_group() {
    echo -e "${BLUE}📦 Creating resource group: ${RESOURCE_GROUP}${NC}"

    if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Resource group already exists${NC}"
    else
        az group create \
            --name "$RESOURCE_GROUP" \
            --location "$LOCATION"
        echo -e "${GREEN}✅ Resource group created${NC}"
    fi
}

# Function to create PostgreSQL database
create_database() {
    echo -e "${BLUE}🗄️  Creating PostgreSQL database...${NC}"

    # Check if server exists
    if az postgres flexible-server show --name "$DB_SERVER_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Database server already exists${NC}"
    else
        echo -e "${BLUE}Creating PostgreSQL flexible server...${NC}"
        az postgres flexible-server create \
            --resource-group "$RESOURCE_GROUP" \
            --name "$DB_SERVER_NAME" \
            --location "$LOCATION" \
            --admin-user "houseiana_admin" \
            --admin-password "HouseianaSecure2024!" \
            --sku-name "Standard_B1ms" \
            --tier "Burstable" \
            --storage-size "32" \
            --version "14" \
            --yes

        echo -e "${GREEN}✅ PostgreSQL server created${NC}"
    fi

    # Create database
    echo -e "${BLUE}Creating database 'houseiana'...${NC}"
    az postgres flexible-server db create \
        --resource-group "$RESOURCE_GROUP" \
        --server-name "$DB_SERVER_NAME" \
        --database-name "houseiana" || true

    # Configure firewall
    echo -e "${BLUE}Configuring firewall rules...${NC}"
    az postgres flexible-server firewall-rule create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$DB_SERVER_NAME" \
        --rule-name "AllowAzureServices" \
        --start-ip-address "0.0.0.0" \
        --end-ip-address "0.0.0.0" || true

    echo -e "${GREEN}✅ Database setup completed${NC}"
}

# Function to create Key Vault
create_keyvault() {
    echo -e "${BLUE}🔐 Creating Azure Key Vault...${NC}"

    az keyvault create \
        --name "$KEYVAULT_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION"

    echo -e "${GREEN}✅ Key Vault created: ${KEYVAULT_NAME}${NC}"

    # Add secrets
    echo -e "${BLUE}Adding secrets to Key Vault...${NC}"

    # Database URL
    DB_URL="postgresql://houseiana_admin:HouseianaSecure2024!@${DB_SERVER_NAME}.postgres.database.azure.com:5432/houseiana?sslmode=require"
    az keyvault secret set \
        --vault-name "$KEYVAULT_NAME" \
        --name "DATABASE-URL" \
        --value "$DB_URL"

    # JWT Secret
    az keyvault secret set \
        --vault-name "$KEYVAULT_NAME" \
        --name "JWT-SECRET" \
        --value "hK9mP3qR7sT2uV8wX1yZ5aB4cD6eF0gH9iJ2kL7mN1oP5qR8sT3uV6wX9yZ2aC5d"

    echo -e "${YELLOW}⚠️  Please manually add your API keys to Key Vault:${NC}"
    echo -e "${YELLOW}   - SENDGRID-API-KEY${NC}"
    echo -e "${YELLOW}   - TWILIO-ACCOUNT-SID${NC}"
    echo -e "${YELLOW}   - TWILIO-AUTH-TOKEN${NC}"

    echo -e "${GREEN}✅ Key Vault secrets configured${NC}"
}

# Function to create App Service
create_app_service() {
    echo -e "${BLUE}🌐 Creating Azure App Service...${NC}"

    # Create App Service Plan
    if az appservice plan show --name "$APPSERVICE_PLAN" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        echo -e "${YELLOW}⚠️  App Service Plan already exists${NC}"
    else
        az appservice plan create \
            --name "$APPSERVICE_PLAN" \
            --resource-group "$RESOURCE_GROUP" \
            --sku "B1" \
            --is-linux
        echo -e "${GREEN}✅ App Service Plan created${NC}"
    fi

    # Create Web App
    az webapp create \
        --resource-group "$RESOURCE_GROUP" \
        --plan "$APPSERVICE_PLAN" \
        --name "$APP_NAME" \
        --runtime "NODE|18-lts"

    echo -e "${GREEN}✅ Web App created: ${APP_NAME}${NC}"
}

# Function to configure App Service
configure_app_service() {
    echo -e "${BLUE}⚙️  Configuring App Service...${NC}"

    # Enable managed identity
    az webapp identity assign \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP"

    # Get principal ID and grant Key Vault access
    PRINCIPAL_ID=$(az webapp identity show --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" --query principalId --output tsv)

    az keyvault set-policy \
        --name "$KEYVAULT_NAME" \
        --object-id "$PRINCIPAL_ID" \
        --secret-permissions get list

    # Configure application settings
    az webapp config appsettings set \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --settings \
            NODE_ENV="production" \
            PORT="3000" \
            AZURE_KEY_VAULT_NAME="$KEYVAULT_NAME" \
            RATE_LIMIT_TTL="900000" \
            RATE_LIMIT_MAX="100" \
            ENABLE_TRACING="false"

    # Set startup command
    az webapp config set \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --startup-file "npm start"

    echo -e "${GREEN}✅ App Service configured${NC}"
}

# Function to deploy application
deploy_application() {
    echo -e "${BLUE}🚀 Deploying application...${NC}"

    # Deploy from current directory
    az webapp up \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --runtime "NODE|18-lts" \
        --logs

    echo -e "${GREEN}✅ Application deployed${NC}"
}

# Function to run database migrations
run_migrations() {
    echo -e "${BLUE}🗃️  Running database migrations...${NC}"

    # Wait for app to be ready
    sleep 30

    # Enable SSH and run migrations
    az webapp ssh --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" --command "cd /home/site/wwwroot && npm run migrate:deploy"

    echo -e "${GREEN}✅ Database migrations completed${NC}"
}

# Function to display deployment summary
deployment_summary() {
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${BLUE}App Name: ${APP_NAME}${NC}"
    echo -e "${BLUE}URL: https://${APP_NAME}.azurewebsites.net${NC}"
    echo -e "${BLUE}API Docs: https://${APP_NAME}.azurewebsites.net/api${NC}"
    echo -e "${BLUE}Health Check: https://${APP_NAME}.azurewebsites.net/health${NC}"
    echo -e "${BLUE}Resource Group: ${RESOURCE_GROUP}${NC}"
    echo -e "${BLUE}Database Server: ${DB_SERVER_NAME}${NC}"
    echo -e "${BLUE}Key Vault: ${KEYVAULT_NAME}${NC}"
    echo -e "${BLUE}===============================================${NC}"

    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo -e "${YELLOW}1. Add your API keys to Key Vault:${NC}"
    echo -e "${YELLOW}   - SENDGRID-API-KEY${NC}"
    echo -e "${YELLOW}   - TWILIO-ACCOUNT-SID${NC}"
    echo -e "${YELLOW}   - TWILIO-AUTH-TOKEN${NC}"
    echo -e "${YELLOW}2. Test your application endpoints${NC}"
    echo -e "${YELLOW}3. Set up custom domain (optional)${NC}"
    echo -e "${YELLOW}4. Configure monitoring and alerts${NC}"
}

# Main deployment flow
main() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    check_azure_cli
    check_azure_login

    echo -e "${BLUE}🏗️  Starting infrastructure setup...${NC}"
    create_resource_group
    create_database
    create_keyvault

    echo -e "${BLUE}🌐 Setting up App Service...${NC}"
    create_app_service
    configure_app_service

    echo -e "${BLUE}🚀 Deploying application...${NC}"
    deploy_application

    echo -e "${BLUE}🗃️  Setting up database...${NC}"
    run_migrations

    deployment_summary
}

# Run main function
main "$@"