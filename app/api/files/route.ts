import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId)
            return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        const searchParams = req.nextUrl.searchParams
        const userID = searchParams.get('userId')
        const parentId = searchParams.get('parentId')
        if (!userID || userId !== userID)
            return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        let fetchedFiles = []
        if (parentId) {
            fetchedFiles = await db.select().from(files).where(and(
                eq(files.userId, userId),
                eq(files.parentId, parentId)
            ))
        } else {
            fetchedFiles = await db.select().from(files).where(and(
                eq(files.userId, userId),
                isNull(files.parentId)
            ))
        }
        return NextResponse.json(fetchedFiles)
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: 'Failed to GET files' }, { status: 500 })
    }
}