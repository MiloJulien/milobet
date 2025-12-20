import NextAuth from "next-auth";
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
    async jwt({ token, user }) {
      // Ajoute les données utilisateur au token lors de la connexion
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username; 
        token.has_bet = user.has_bet;
        token.points = user.points;
      }

      // Vérifie si le champ `bet` a changé dans la base de données uniquement si nécessaire
      const updatedUser = await findUserByEmail(token.email); // Récupère les données utilisateur mises à jour
      if (updatedUser && updatedUser.has_bet !== token.has_bet) {
        token.has_bet = updatedUser.has_bet; // Met à jour le champ `bet` dans le token
      }

      return token;
    },
    async session({ session, token }) {
      // Ajoute les données du token à la session côté client
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
