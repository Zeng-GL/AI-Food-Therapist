import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION }),
);

const TABLE_NAME = "Users";

// GET /api/user/profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const googleId = (session.user as any).id;

  try {
    const { Item } = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { googleId },
      }),
    );

    if (!Item) {
      return NextResponse.json({ profile: null, onboardingCompleted: false });
    }

    if (!Item || Item.accountStatus === "DEACTIVATED") {
      return NextResponse.json(
        { error: "Account not found or deactivated" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      profile: Item,
      onboardingCompleted: Item.onboardingCompleted === true,
    });
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// PUT /api/user/profile
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const googleId = (session.user as any).id;
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // 1. 動態構建更新參數
  const updateParts: string[] = [
    "onboardingCompleted = :done",
    "updatedAt = :updatedAt",
  ];
  const exprAttrValues: Record<string, any> = {
    ":done": true,
    ":updatedAt": new Date().toISOString(),
  };

  // 定義哪些欄位允許從 body 更新
  const allowedFields = [
    "gender",
    "ageGroup",
    "primaryGoals",
    "sleepHabit",
    "stressLevel",
    "allergies",
    "dietType",
    "medicalConditions",
    "customAllergy",
    "customDietType",
    "customMedicalCondition",
  ];

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      // 只有當前端有傳這個 Key 時才更新
      updateParts.push(`${field} = :${field}`);
      exprAttrValues[`:${field}`] = body[field];
    }
  });

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { googleId },
        UpdateExpression: `SET ${updateParts.join(", ")}`,
        ExpressionAttributeValues: exprAttrValues,
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const googleId = (session.user as any).id;

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: "Users",
        Key: { googleId },
        UpdateExpression: "SET accountStatus = :status, deletedAt = :now",
        ExpressionAttributeValues: {
          ":status": "DEACTIVATED", // 或者用 isDeleted: true
          ":now": new Date().toISOString(),
        },
      }),
    );

    return NextResponse.json({ success: true, message: "Account deactivated" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to deactivate account" },
      { status: 500 },
    );
  }
}
