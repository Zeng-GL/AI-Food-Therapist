import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"; // 新增 S3 引用
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // 新增簽名工具
import { v4 as uuidv4 } from "uuid";

// 初始化 AWS Clients
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// POST 部分保持不變 (假設你存入的是 S3 的 Key 或者是包含路徑的 URL)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { diagnosisData, imageUrl } = await req.json();

    await ddb.send(
      new PutCommand({
        TableName: "DiagnosisHistory",
        Item: {
          historyId: uuidv4(),
          userId: (session.user as any).id,
          email: session.user.email,
          result: diagnosisData,
          imageUrl: imageUrl,
          createdAt: new Date().toISOString(),
        },
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DynamoDB Save Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;

    // 1. 從 DynamoDB 撈取紀錄
    const { Items } = await ddb.send(
      new QueryCommand({
        TableName: "DiagnosisHistory",
        KeyConditionExpression: "userId = :uid",
        FilterExpression:
          "attribute_not_exists(isDeleted) OR isDeleted = :false",
        ExpressionAttributeValues: {
          ":uid": userId,
          ":false": false,
        },
      }),
    );

    if (!Items) return NextResponse.json({ items: [] });

    // 2. 為每一筆紀錄生成臨時的 S3 讀取網址
    const itemsWithSignedUrls = await Promise.all(
      Items.map(async (item) => {
        if (!item.imageUrl) return item;

        try {
          // 解析 S3 Key: 如果存的是完整網址，需要去掉前綴拿掉 Key
          // 如果存的是單純路徑 (如 uploads/xxx.jpg)，直接用即可
          let s3Key = item.imageUrl;
          if (s3Key.includes("amazonaws.com/")) {
            s3Key = s3Key.split("amazonaws.com/")[1];
          }

          const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: s3Key,
          });

          // 生成有效期為 3600 秒 (1小時) 的讀取網址
          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          });

          return {
            ...item,
            imageUrl: signedUrl, // 將資料庫的 Key 替換為臨時可訪問的網址
          };
        } catch (s3Error) {
          console.error(
            "Error signing S3 URL for key:",
            item.imageUrl,
            s3Error,
          );
          return item; // 簽名失敗則回傳原始資料
        }
      }),
    );

    return NextResponse.json({ items: itemsWithSignedUrls });
  } catch (error) {
    console.error("DynamoDB Query Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}


/**
 * GET /api/history
 * 撈取該用戶「目前生命週期」內的所有紀錄
 */
// export async function GET(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const userId = (session.user as any).id;

//     // --- 步驟 A: 先從 Users 表查出最後一次註銷的時間 (deactivatedAt) ---
//     const { Item: userProfile } = await ddb.send(
//       new GetCommand({
//         TableName: "Users",
//         Key: { googleId: userId },
//       }),
//     );

//     // 如果用戶已被標記為停用，則不回傳任何紀錄
//     if (!userProfile || userProfile.accountStatus === "DEACTIVATED") {
//       return NextResponse.json({ items: [] });
//     }


//     const lastDeletePoint = userProfile.deactivatedAt || "1970-01-01T00:00:00Z";

//     // --- 步驟 B: 使用 GSI (userId-createdAt-index) 進行條件查詢 ---
//     const { Items } = await ddb.send(
//       new QueryCommand({
//         TableName: "DiagnosisHistory",
//         IndexName: "userId-createdAt-index", // 💡 請確保 Console 已建立此索引
//         KeyConditionExpression: "userId = :uid AND createdAt > :lastDelete",
//         FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :false",
//         ExpressionAttributeValues: {
//           ":uid": userId,
//           ":lastDelete": lastDeletePoint,
//           ":false": false,
//         },
//         ScanIndexForward: false, // 最新的排在最前面
//       }),
//     );

//     if (!Items || Items.length === 0) {
//       return NextResponse.json({ items: [] });
//     }

//     // --- 步驟 C: 為圖片生成 S3 臨時網址 (Signed URL) ---
//     const itemsWithSignedUrls = await Promise.all(
//       Items.map(async (item) => {
//         if (!item.imageUrl) return item;

//         try {
//           let s3Key = item.imageUrl;
//           if (s3Key.includes("amazonaws.com/")) {
//             s3Key = s3Key.split("amazonaws.com/")[1];
//           }

//           const command = new GetObjectCommand({
//             Bucket: process.env.AWS_S3_BUCKET_NAME,
//             Key: s3Key,
//           });

//           const signedUrl = await getSignedUrl(s3Client, command, {
//             expiresIn: 3600,
//           });

//           return {
//             ...item,
//             imageUrl: signedUrl,
//           };
//         } catch (s3Error) {
//           console.error(`S3 signing error for ${item.imageUrl}:`, s3Error);
//           return item;
//         }
//       }),
//     );

//     return NextResponse.json({ items: itemsWithSignedUrls });
//   } catch (error) {
//     console.error("GET History Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

/**
 * DELETE /api/history
 * 單筆紀錄的軟刪除
 */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { createdAt, historyId } = await req.json(); // 根據你的 Table Key 定義傳入
    const userId = (session.user as any).id;

    await ddb.send(
      new UpdateCommand({
        TableName: "DiagnosisHistory",
        Key: {
          userId: userId,
          historyId: historyId, 
        },
        UpdateExpression: "SET isDeleted = :deleted, updatedAt = :now",
        ConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":deleted": true,
          ":now": new Date().toISOString(),
          ":uid": userId,
        },
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}