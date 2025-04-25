# Onboarding Guide: Scaffold Your Shape

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/TannedCung/Scaffold-your-shape.git
   cd Scaffold-your-shape
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables**
   - Copy `.env.example` to `.env.local` and fill in your Supabase and Auth credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     NEXTAUTH_URL=http://localhost:3006
     NEXTAUTH_SECRET=your-nextauth-secret
     ```
4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:3006](http://localhost:3006)

5. **Docker (optional)**
   ```bash
   docker compose up -d --build
   ```

## Useful Links
- [Supabase Documentation](https://supabase.com/docs)
- [MUI Documentation](https://mui.com/)
- [NextAuth.js Documentation](https://authjs.dev/)
