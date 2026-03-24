import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";


const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));

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

  return NextResponse.json({ item: latest });
}