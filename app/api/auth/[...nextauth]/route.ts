import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// 將 Client 移出 handler 提升效能
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // 1. 設定 Session 策略與過期時間
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 天，這會讓 Cookie 變成長效期
    updateAge: 24 * 60 * 60,   // 每天更新一次
  },
  // 2. 必須設定 secret，加密 Cookie 用
  secret: process.env.NEXTAUTH_SECRET,
  
  // 3. 設定瀏覽器 Cookie 的屬性 (確保層級與 providers 平級)
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 必須與 session.maxAge 一致
      },
    },
  },

  callbacks: {
    // 登入時存入 DynamoDB
    async signIn({ user }: any) {
      try {
        await ddb.send(new PutCommand({
          TableName: "Users",
          Item: {
            googleId: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            lastLogin: new Date().toISOString(),
          },
        }));
        return true;
      } catch (error) {
        console.error("存入 AWS 失敗", error);
        return true; // 即使失敗也讓使用者進入 App
      }
    },

    // 將 id 存入 JWT Token 中
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // 讓前端 useSession() 可以拿到這個 id
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };