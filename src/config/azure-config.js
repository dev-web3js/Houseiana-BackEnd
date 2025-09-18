// Azure-specific configuration for Houseiana Backend
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

class AzureConfig {
  constructor() {
    this.keyVaultName = process.env.AZURE_KEY_VAULT_NAME;
    this.keyVaultUrl = `https://${this.keyVaultName}.vault.azure.net`;
    this.credential = null;
    this.secretClient = null;
    this.secrets = new Map();

    if (this.keyVaultName && process.env.NODE_ENV === 'production') {
      this.initializeKeyVault();
    }
  }

  initializeKeyVault() {
    try {
      this.credential = new DefaultAzureCredential();
      this.secretClient = new SecretClient(this.keyVaultUrl, this.credential);
      console.log('✅ Azure Key Vault client initialized');
    } catch (error) {
      console.warn('⚠️  Failed to initialize Azure Key Vault:', error.message);
    }
  }

  async getSecret(secretName) {
    if (!this.secretClient) {
      // Fallback to environment variables
      const envName = secretName.replace(/-/g, '_').toUpperCase();
      return process.env[envName];
    }

    try {
      // Check cache first
      if (this.secrets.has(secretName)) {
        return this.secrets.get(secretName);
      }

      const secret = await this.secretClient.getSecret(secretName);
      this.secrets.set(secretName, secret.value);
      return secret.value;
    } catch (error) {
      console.warn(`⚠️  Failed to get secret ${secretName} from Key Vault:`, error.message);

      // Fallback to environment variables
      const envName = secretName.replace(/-/g, '_').toUpperCase();
      return process.env[envName];
    }
  }

  async loadAllSecrets() {
    if (!this.secretClient) {
      console.log('🔄 Using environment variables (Key Vault not available)');
      return;
    }

    try {
      console.log('🔐 Loading secrets from Azure Key Vault...');

      const secretNames = [
        'DATABASE-URL',
        'JWT-SECRET',
        'SENDGRID-API-KEY',
        'TWILIO-ACCOUNT-SID',
        'TWILIO-AUTH-TOKEN'
      ];

      const secretPromises = secretNames.map(async (name) => {
        try {
          const value = await this.getSecret(name);
          if (value) {
            const envName = name.replace(/-/g, '_');
            process.env[envName] = value;
            console.log(`✅ Loaded secret: ${name}`);
          }
        } catch (error) {
          console.warn(`⚠️  Failed to load secret ${name}:`, error.message);
        }
      });

      await Promise.allSettled(secretPromises);
      console.log('🔐 Finished loading secrets from Key Vault');
    } catch (error) {
      console.warn('⚠️  Error loading secrets from Key Vault:', error.message);
    }
  }

  // Azure App Service specific configurations
  getAppServiceConfig() {
    return {
      port: process.env.PORT || 3000,
      nodeEnv: process.env.NODE_ENV || 'development',
      websiteInstanceId: process.env.WEBSITE_INSTANCE_ID,
      websiteSiteName: process.env.WEBSITE_SITE_NAME,
      websiteResourceGroup: process.env.WEBSITE_RESOURCE_GROUP,
      websiteOwnerName: process.env.WEBSITE_OWNER_NAME,
      isAzure: !!(process.env.WEBSITE_SITE_NAME || process.env.AZURE_CLIENT_ID),
      region: process.env.WEBSITE_LOCATION || 'unknown'
    };
  }

  // Health check specific to Azure
  getHealthCheckInfo() {
    const config = this.getAppServiceConfig();
    return {
      service: 'houseiana-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: config.nodeEnv,
      azure: {
        isAzureAppService: config.isAzure,
        instanceId: config.websiteInstanceId,
        siteName: config.websiteSiteName,
        resourceGroup: config.websiteResourceGroup,
        region: config.region
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}

export const azureConfig = new AzureConfig();
export default azureConfig;