import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const { Items } = await ddb.send(new QueryCommand({
    TableName: "DiagnosisHistory",
    IndexName: "userId-createdAt-index",  // search Index in WS DynamoDB
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: {
      ":uid": userId,
    },
    ScanIndexForward: false,
    Limit: 1,                
  }));


  const latest = Items?.[0];
  if (!latest) return NextResponse.json({ item: null });

  // Signed URL
//   if (latest.imageUrl) {
//     let s3Key = latest.imageUrl;
//     if (s3Key.startsWith("https://")) {
//       s3Key = new URL(s3Key).pathname.slice(1);
//     }
//     latest.imageUrl = await getSignedUrl(
//       s3Client,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: s3Key }),
//       { expiresIn: 3600 }
//     );
//   }

  return NextResponse.json({ item: latest });
}