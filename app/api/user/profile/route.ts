// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION }),
);

const TABLE_NAME = "Users";

/**
 * GET /api/user/profile
 * 取得使用者檔案，若帳號已停用則回傳 404
 */
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

    // 如果找不到用戶，或者帳號狀態為已停用 (軟刪除狀態)
    if (!Item || Item.accountStatus === "DEACTIVATED") {
      return NextResponse.json(
        { profile: null, onboardingCompleted: false, status: "DEACTIVATED" },
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

/**
 * PUT /api/user/profile
 * 更新使用者檔案 / 重新激活帳號
 */
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

  // --- 核心修改邏輯 ---
  // 1. 基本更新參數：標記已完成導覽、更新時間
  const updateParts: string[] = [
    "onboardingCompleted = :done",
    "updatedAt = :updatedAt",
    "accountStatus = :active", // 確保狀態設為 ACTIVE
  ];

  const exprAttrValues: Record<string, any> = {
    ":done": true,
    ":updatedAt": new Date().toISOString(),
    ":active": "ACTIVE",
  };

  /**
   * 方案一重點：
   * 如果這是用戶「重新註冊/重新開始」，我們更新 lastJoinedAt。
   * 之後 GET /api/history 會以此時間為準，只抓取之後的紀錄。
   */
  updateParts.push("lastJoinedAt = :now");
  exprAttrValues[":now"] = new Date().toISOString();

  // 2. 定義允許更新的欄位 (從前端傳來的問卷資料)
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

/**
 * DELETE /api/user/profile
 * 軟刪除：將帳號標記為停用
 */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const googleId = (session.user as any).id;

  try {
    const now = new Date().toISOString();
    await ddb.send(
      new UpdateCommand({
        TableName: "Users",
        Key: { googleId },
        UpdateExpression: "SET accountStatus = :status, deactivatedAt = :now", // Record moment
        ExpressionAttributeValues: {
          ":status": "DEACTIVATED",
          ":now": now,
        },
      }),
    );

    return NextResponse.json({
      success: true,
      message: "Account deactivated successfully.",
    });
  } catch (error) {
    console.error("Failed to deactivate account:", error);
    return NextResponse.json(
      { error: "Failed to deactivate account" },
      { status: 500 },
    );
  }
}
