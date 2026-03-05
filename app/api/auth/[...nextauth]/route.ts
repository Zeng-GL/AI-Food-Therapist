import NextAuth from "next-auth";
import { authOptions } from "./auth"; // 引用剛才分離出來的設定

const handler = NextAuth(authOptions);

// 這裡只 export GET 和 POST，解決 Vercel 編譯報錯
export { handler as GET, handler as POST };