import { NextResponse } from "next/server";
import { sendInviteEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, workspaceId, role } = await req.json();

    if (!email || !workspaceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // In a real app, you would create an invite token, save it to DB,
    // and then construct a URL containing that token.
    const mockToken = "mock-token-123";
    const inviteUrl = `http://localhost:3000/invite?token=${mockToken}`;

    await sendInviteEmail(email, "Workspace Alpha", inviteUrl);

    return NextResponse.json({ success: true, message: "Invite sent" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
