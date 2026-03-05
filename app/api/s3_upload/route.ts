import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { NextResponse } from "next/server";


const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions); // 從伺服器端獲取目前的 Session

    // 預設狀態
    let folder = "guests";
    let userId = "anonymous";

    if (session?.user) {
    // 如果有登入，使用 session 中的用戶 ID
    userId = (session.user as any).id;
    folder = `members/${userId}`;
  } else {
    // 如果沒登入，可以給一個訪客路徑或是直接擋掉
    folder = `guests/tmp_${uuidv4()}`;
  }

  const currentDate: Date = new Date();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dateFolder = new Date().toISOString().split("T")[0]; // "2026-03-05"
  const key = `${folder}/${dateFolder}/${timestamp}_tongue.jpg`;

    // 從前端傳來的 body 取得檔案類型
    const { fileType } = await req.json(); 

    // 上傳S3參數設定，ContentType需要和前端上傳的檔案類型一致，這樣OpenAI才能正確處理
    const putCmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      ContentType: fileType, 
    });

    const uploadUrl = await getSignedUrl(s3, putCmd, { expiresIn: 60 });

    // 給 OpenAI 用
    const getCmd = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    const viewUrl = await getSignedUrl(s3, getCmd, { expiresIn: 300 });

    return NextResponse.json({
    uploadUrl,
    viewUrl,
    key, 
    userId
  });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "簽名失敗" }, { status: 500 });
  }
}