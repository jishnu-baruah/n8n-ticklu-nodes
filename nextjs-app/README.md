# NEAR Signing App

This is a Next.js application that provides a user interface for signing NEAR transactions in the human-in-the-loop flow.

## Features

- Transaction signing UI with NEAR Wallet integration
- Serverless callback handling
- Support for both mainnet and testnet
- Responsive design with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (optional):
```bash
export N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/near-callback"
export TRANSACTION_STORAGE_URL="https://your-storage-service.com"
```

3. Start the development server:
```bash
npm run dev
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

1. Build the app:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Environment Variables

- `N8N_WEBHOOK_URL` - URL to send callback results to n8n webhook
- `TRANSACTION_STORAGE_URL` - URL for storing transaction results

## Integration with n8n

1. Deploy this app to get your callback URL
2. Configure the callback URL in your n8n Ticklu credentials
3. Use "Human Signing (Wallet)" mode in your n8n workflows

## Pages

- `/sign-transaction` - Main signing page (used by n8n workflows)
- `/api/near-callback` - Serverless function for handling callbacks

## Customization

- Modify `pages/sign-transaction.js` to customize the signing UI
- Update `pages/api/near-callback.js` to change callback handling logic
- Add Tailwind CSS classes for styling changes

