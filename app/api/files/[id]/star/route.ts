import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId)
            return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        const { id } = await params
        if (!id)
            return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
        const [file] = await db.select().from(files).where(and(
            eq(files.id, id),
            eq(files.userId, userId)
        ))
        if (!file)
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        const [updatedFile] = await db
            .update(files)
            .set({ isStarred: !file.isStarred })
            .where(and(
                eq(files.id, id),
                eq(files.userId, userId)
            ))
            .returning()
        return NextResponse.json(updatedFile)
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
    }
}