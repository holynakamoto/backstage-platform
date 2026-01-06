# ${{ values.name }}

${{ values.description }}

## Overview

This is a Node.js Express website created using Backstage Software Templates. It demonstrates the golden path for creating standardized, production-ready components.

## Architecture

This service is built with:

- **Express.js** - Web framework for Node.js
- **Node.js** - JavaScript runtime

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

\`\`\`bash
npm install
\`\`\`

### Running Locally

Start the development server:

\`\`\`bash
npm start
\`\`\`

Or use nodemon for auto-reload during development:

\`\`\`bash
npm run dev
\`\`\`

The service will be available at \`http://localhost:3000\` (or the port specified by the \`PORT\` environment variable).

## API Reference

### GET /

Returns service information including name, description, status, and timestamp.

**Response:**

\`\`\`json
{
  "name": "${{ values.name }}",
  "description": "${{ values.description }}",
  "status": "running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

### GET /health

Health check endpoint for monitoring and load balancers.

**Response:**

\`\`\`json
{
  "status": "healthy"
}
\`\`\`

## Configuration

The service can be configured using environment variables:

- \`PORT\` - Port number to listen on (default: 3000)

## Development

### Project Structure

\`\`\`
.
├── server.js          # Main application entry point
├── package.json       # Dependencies and scripts
├── README.md          # Project documentation
├── docs/              # TechDocs documentation
│   └── index.md       # This file
└── catalog-info.yaml  # Backstage catalog metadata
\`\`\`

## Deployment

This component was created using Backstage Software Templates, which enforces:

- ✅ Standardized project structure
- ✅ Automatic catalog registration
- ✅ Co-located documentation with TechDocs
- ✅ Golden path compliance

## Support

For questions or issues, contact the owner: **${{ values.owner }}**

## License

This is an internal service component.

