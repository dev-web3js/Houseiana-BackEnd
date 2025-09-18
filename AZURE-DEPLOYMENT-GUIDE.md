# 🚀 Houseiana Backend - Azure Deployment Guide

> **Complete step-by-step guide to deploy your Houseiana Backend on Microsoft Azure**

## 📋 Overview

We'll deploy your Node.js backend using:
- **Azure App Service** - For hosting the Node.js API
- **Azure Database for PostgreSQL** - Managed PostgreSQL database
- **Azure Key Vault** - For secure secrets management
- **GitHub Actions** - For CI/CD pipeline

## 🔧 Prerequisites

1. **Azure Account** - [Sign up for free](https://azure.microsoft.com/free/)
2. **Azure CLI** - [Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **GitHub Repository** - Your code in GitHub (✅ Done)

## 📦 Step 1: Install Azure CLI & Login

### Install Azure CLI:
```bash
# macOS
brew install azure-cli

# Ubuntu/Debian
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Windows (PowerShell as Admin)
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi; Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'
```

### Login to Azure:
```bash
az login
```

### Set your subscription (if you have multiple):
```bash
# List subscriptions
az account list --output table

# Set active subscription
az account set --subscription "Your-Subscription-ID"
```

## 🏗️ Step 2: Create Resource Group

```bash
# Create resource group in East US (you can change location)
az group create \
  --name "houseiana-rg" \
  --location "eastus"
```

## 🗄️ Step 3: Create Azure Database for PostgreSQL

```bash
# Create PostgreSQL flexible server
az postgres flexible-server create \
  --resource-group "houseiana-rg" \
  --name "houseiana-db-server" \
  --location "eastus" \
  --admin-user "houseiana_admin" \
  --admin-password "HouseianaSecure2024!" \
  --sku-name "Standard_B1ms" \
  --tier "Burstable" \
  --storage-size "32" \
  --version "14"
```

### Create the database:
```bash
az postgres flexible-server db create \
  --resource-group "houseiana-rg" \
  --server-name "houseiana-db-server" \
  --database-name "houseiana"
```

### Configure firewall (allow Azure services):
```bash
az postgres flexible-server firewall-rule create \
  --resource-group "houseiana-rg" \
  --name "houseiana-db-server" \
  --rule-name "AllowAzureServices" \
  --start-ip-address "0.0.0.0" \
  --end-ip-address "0.0.0.0"
```

## 🔐 Step 4: Create Azure Key Vault for Secrets

```bash
# Create Key Vault
az keyvault create \
  --name "houseiana-kv-$(date +%s)" \
  --resource-group "houseiana-rg" \
  --location "eastus"

# Store your Key Vault name for later use
KEYVAULT_NAME="houseiana-kv-$(date +%s)"
echo "Your Key Vault name: $KEYVAULT_NAME"
```

### Add secrets to Key Vault:
```bash
# Database connection string
az keyvault secret set \
  --vault-name "$KEYVAULT_NAME" \
  --name "DATABASE-URL" \
  --value "postgresql://houseiana_admin:HouseianaSecure2024!@houseiana-db-server.postgres.database.azure.com:5432/houseiana?sslmode=require"

# JWT Secret
az keyvault secret set \
  --vault-name "$KEYVAULT_NAME" \
  --name "JWT-SECRET" \
  --value "hK9mP3qR7sT2uV8wX1yZ5aB4cD6eF0gH9iJ2kL7mN1oP5qR8sT3uV6wX9yZ2aC5d"

# SendGrid API Key (replace with your actual key)
az keyvault secret set \
  --vault-name "$KEYVAULT_NAME" \
  --name "SENDGRID-API-KEY" \
  --value "your-sendgrid-api-key-here"

# Twilio credentials (replace with your actual credentials)
az keyvault secret set \
  --vault-name "$KEYVAULT_NAME" \
  --name "TWILIO-ACCOUNT-SID" \
  --value "your-twilio-account-sid"

az keyvault secret set \
  --vault-name "$KEYVAULT_NAME" \
  --name "TWILIO-AUTH-TOKEN" \
  --value "your-twilio-auth-token"
```

## 🌐 Step 5: Create Azure App Service

### Create App Service Plan:
```bash
az appservice plan create \
  --name "houseiana-plan" \
  --resource-group "houseiana-rg" \
  --sku "B1" \
  --is-linux
```

### Create Web App:
```bash
az webapp create \
  --resource-group "houseiana-rg" \
  --plan "houseiana-plan" \
  --name "houseiana-backend-$(date +%s)" \
  --runtime "NODE|18-lts"

# Store your app name for later use
APP_NAME="houseiana-backend-$(date +%s)"
echo "Your App Service name: $APP_NAME"
```

## ⚙️ Step 6: Configure App Service Settings

### Enable managed identity for Key Vault access:
```bash
az webapp identity assign \
  --name "$APP_NAME" \
  --resource-group "houseiana-rg"
```

### Grant Key Vault access to the web app:
```bash
# Get the web app's principal ID
PRINCIPAL_ID=$(az webapp identity show --name "$APP_NAME" --resource-group "houseiana-rg" --query principalId --output tsv)

# Grant access to Key Vault
az keyvault set-policy \
  --name "$KEYVAULT_NAME" \
  --object-id "$PRINCIPAL_ID" \
  --secret-permissions get list
```

### Configure application settings:
```bash
az webapp config appsettings set \
  --name "$APP_NAME" \
  --resource-group "houseiana-rg" \
  --settings \
    NODE_ENV="production" \
    PORT="3000" \
    AZURE_KEY_VAULT_NAME="$KEYVAULT_NAME" \
    RATE_LIMIT_TTL="900000" \
    RATE_LIMIT_MAX="100" \
    ENABLE_TRACING="false"
```

## 🚀 Step 7: Deploy Your Code

### Option A: Deploy from GitHub (Recommended)

```bash
# Configure GitHub deployment
az webapp deployment source config \
  --name "$APP_NAME" \
  --resource-group "houseiana-rg" \
  --repo-url "https://github.com/dev-web3js/Houseiana-BackEnd" \
  --branch "main" \
  --manual-integration
```

### Option B: Deploy from local code

```bash
# Navigate to your project directory
cd "/Users/goldenloonie/Library/CloudStorage/OneDrive-Personal/Desktop/next JS project/Houseiana Backend"

# Deploy using Azure CLI
az webapp up \
  --name "$APP_NAME" \
  --resource-group "houseiana-rg" \
  --runtime "NODE|18-lts"
```

## 🔧 Step 8: Configure Startup Command

```bash
# Set startup command for your Node.js app
az webapp config set \
  --name "$APP_NAME" \
  --resource-group "houseiana-rg" \
  --startup-file "npm start"
```

## 🗃️ Step 9: Run Database Migrations

### Enable SSH for App Service:
```bash
az webapp config set \
  --name "$APP_NAME" \
  --resource-group "houseiana-rg" \
  --remote-debugging-enabled true
```

### SSH into your app and run migrations:
```bash
# Get SSH URL
az webapp ssh --name "$APP_NAME" --resource-group "houseiana-rg"

# Once connected, run:
npm run migrate:deploy
# or
npx prisma migrate deploy
```

## 🌍 Step 10: Configure Custom Domain (Optional)

If you have a custom domain:

```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name "$APP_NAME" \
  --resource-group "houseiana-rg" \
  --hostname "api.yourdomain.com"

# Enable SSL
az webapp config ssl create \
  --name "$APP_NAME" \
  --resource-group "houseiana-rg" \
  --hostname "api.yourdomain.com"
```

## 🔍 Step 11: Monitor and Test

### Get your app URL:
```bash
echo "Your app is available at: https://$APP_NAME.azurewebsites.net"
```

### Test the health endpoint:
```bash
curl "https://$APP_NAME.azurewebsites.net/health"
```

### View logs:
```bash
az webapp log tail \
  --name "$APP_NAME" \
  --resource-group "houseiana-rg"
```

## 🔄 Step 12: Set Up CI/CD with GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches:
      - main

env:
  AZURE_WEBAPP_NAME: your-app-name-here
  AZURE_WEBAPP_PACKAGE_PATH: '.'
  NODE_VERSION: '18.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: npm install and build
      run: |
        npm ci
        npm run build --if-present

    - name: 'Deploy to Azure WebApp'
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ${{ env.AZURE_WEBAPP_PACKAGE_PATH }}
```

## 📊 Monitoring & Scaling

### Enable Application Insights:
```bash
az monitor app-insights component create \
  --app "houseiana-insights" \
  --location "eastus" \
  --resource-group "houseiana-rg"
```

### Scale your app:
```bash
# Scale up (more powerful instance)
az appservice plan update \
  --name "houseiana-plan" \
  --resource-group "houseiana-rg" \
  --sku "P1V2"

# Scale out (more instances)
az webapp config appsettings set \
  --name "$APP_NAME" \
  --resource-group "houseiana-rg" \
  --settings WEBSITE_INSTANCE_COUNT="3"
```

## 🛠️ Troubleshooting

### Common Issues:

1. **App not starting**: Check logs with `az webapp log tail`
2. **Database connection issues**: Verify firewall rules and connection string
3. **Key Vault access denied**: Check managed identity permissions
4. **Build failures**: Ensure all dependencies are in package.json

### Useful Commands:

```bash
# Restart app
az webapp restart --name "$APP_NAME" --resource-group "houseiana-rg"

# View configuration
az webapp config show --name "$APP_NAME" --resource-group "houseiana-rg"

# Stream logs
az webapp log tail --name "$APP_NAME" --resource-group "houseiana-rg"
```

## 💰 Cost Optimization

- **Basic tier (B1)**: ~$13/month
- **PostgreSQL Flexible**: ~$12/month
- **Key Vault**: ~$1/month
- **Total**: ~$26/month

To reduce costs:
- Use **Free tier** for App Service (limitations apply)
- Use **Burstable** database tier
- Set up **auto-scaling** to scale down during low usage

## 🔗 Next Steps

1. **Set up monitoring** with Application Insights
2. **Configure alerts** for downtime/errors
3. **Set up backup** for your database
4. **Implement blue-green deployment** for zero-downtime updates
5. **Add Azure Front Door** for global CDN and DDoS protection

## 📞 Support

- Azure Documentation: https://docs.microsoft.com/azure/
- Azure Support: Available through Azure Portal
- Community: Stack Overflow with `azure` tag

---

🎯 **Your Houseiana Backend will be live at: `https://your-app-name.azurewebsites.net`**