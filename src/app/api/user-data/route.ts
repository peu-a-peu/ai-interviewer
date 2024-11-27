import { NextResponse } from "next/server";
import { getUserByEmail } from "@/server/api/services/userDataService";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
