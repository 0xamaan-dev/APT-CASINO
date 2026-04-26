import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Legacy stub — mock VRF helpers were removed; return explicit no-op for old clients. */
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Not implemented — use /api/generate-entropy for entropy." },
    { status: 410 }
  );
}
