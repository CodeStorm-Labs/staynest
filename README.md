## Development Setup

1. Create a `.env.local` file in the project root with the following variables:
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blognate"
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   GITHUB_CLIENT_ID="your_github_client_id"
   GITHUB_CLIENT_SECRET="your_github_client_secret"
   ```
2. Start the database:
   ```bash
   docker-compose up -d
   ```
3. Push the database schema:
   ```bash
   npm run db:push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ``` 