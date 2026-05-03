import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth";
import { findUserByEmail } from "@/lib/userService";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const user = await findUserByEmail(credentials.email);
        if (!user) {
          throw new Error("Utilisateur non trouvé");
        }
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Mot de passe incorrect");
        }
        return { id: user.id, email: user.email , username: user.username, has_bet: user.has_bet, points: user.points}; 
      },
    }),
  ],
  session: {
    strategy: "jwt", // Utilise JWT pour les sessions
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Connexion initiale — on stocke tout
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.has_bet = user.has_bet;
        token.points = user.points;
      }

      // 2. Mise à jour manuelle via update() côté client
      if (trigger === 'update' && session) {
        token.has_bet = session.has_bet;
        token.points = session.points;
      }

      return token; // ← plus de DB query ici
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        username: token.username,
        has_bet: token.has_bet,
        points: token.points,
      };
      return session;
    },
  },
  secret: process.env.JWT_SECRET, // Clé secrète pour signer les tokens
};
