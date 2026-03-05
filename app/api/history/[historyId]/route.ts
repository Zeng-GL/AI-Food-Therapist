import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb"; // ← 換成 GetCommand
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION }),
);
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  req: Request,
  { params }: { params: { historyId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { historyId } = params;

  // ✅ 用 GetCommand 精確查單筆，需要 PK + SK
  const { Item } = await ddb.send(
    new GetCommand({
      TableName: "DiagnosisHistory",
      Key: {
        userId: userId,
        historyId: historyId,
      },
    }),
  );

  if (!Item) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  // Signed URL
  if (Item.imageUrl) {
    let s3Key = Item.imageUrl;

    if (s3Key.includes("amazonaws.com/")) {
      s3Key = s3Key.split("amazonaws.com/")[1];
    }

    Item.imageUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: s3Key }),
      { expiresIn: 3600 },
    );
  }

  return NextResponse.json({ item: Item });
}
