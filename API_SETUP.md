# 1inch API Setup

## Getting Your API Key

1. Visit [1inch Developer Portal](https://portal.1inch.dev/)
2. Sign up or log in to your account
3. Create a new API key
4. Copy your API key

## Environment Configuration

Create a `.env.local` file in the `packages/nextjs/` directory with your API key:

```bash
# 1inch API Configuration
NEXT_PUBLIC_1INCH_API_KEY=your_1inch_api_key_here

# Chain Configuration - Sepolia testnet
NEXT_PUBLIC_CHAIN_ID=11155111

# Demo Mode (optional)
NEXT_PUBLIC_DEMO_MODE=false
```

## Sepolia Testnet Setup

The application is configured to use Sepolia testnet by default. Make sure your wallet is connected to Sepolia testnet.

### Sepolia Testnet Details:
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- **Block Explorer**: https://sepolia.etherscan.io/

### Getting Sepolia ETH:
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request test ETH for gas fees

## API Key Benefits

With an API key, you get:
- Higher rate limits
- Better reliability
- Access to premium features
- Enhanced support

## Usage

The API key is automatically used in all 1inch API requests:
- Quote requests
- Swap transactions
- Token metadata
- Wallet balances

## Security

- Never commit your API key to version control
- Use environment variables for configuration
- Keep your API key secure and private
