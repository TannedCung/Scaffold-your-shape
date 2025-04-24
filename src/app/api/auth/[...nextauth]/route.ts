import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Export a single handler for all HTTP methods
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH, handler as HEAD, handler as OPTIONS };
