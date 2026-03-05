import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION })
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
      })
    );

    if (!Item) {
      return NextResponse.json({ profile: null, onboardingCompleted: false });
    }

    return NextResponse.json({
      profile: Item,
      onboardingCompleted: Item.onboardingCompleted === true,
    });
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
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

  let body: {
    gender?: string | null;
    ageGroup?: string | null;
    primaryGoals?: string[];
    sleepHabit?: string | null;
    stressLevel?: number;
    allergies?: string[];
    dietType?: string;
    medicalConditions?: string[];
    customAllergy?: string;
    customDietType?: string;
    customMedicalCondition?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { googleId },
        UpdateExpression: `SET
          onboardingCompleted = :done,
          gender = :gender,
          ageGroup = :ageGroup,
          primaryGoals = :primaryGoals,
          sleepHabit = :sleepHabit,
          stressLevel = :stressLevel,
          allergies = :allergies,
          dietType = :dietType,
          medicalConditions = :medicalConditions,
          customAllergy = :customAllergy,
          customDietType = :customDietType,
          customMedicalCondition = :customMedicalCondition,
          updatedAt = :updatedAt
        `,
        ExpressionAttributeValues: {
          ":done": true,
          ":gender": body.gender ?? null,
          ":ageGroup": body.ageGroup ?? null,
          ":primaryGoals": body.primaryGoals ?? [],
          ":sleepHabit": body.sleepHabit ?? null,
          ":stressLevel": body.stressLevel ?? 0,
          ":allergies": body.allergies ?? [],
          ":dietType": body.dietType ?? "General",
          ":medicalConditions": body.medicalConditions ?? [],
          ":customAllergy": body.customAllergy ?? "",
          ":customDietType": body.customDietType ?? "",
          ":customMedicalCondition": body.customMedicalCondition ?? "",
          ":updatedAt": new Date().toISOString(),
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}