import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from 'uuid'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId)
            return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        const body = await req.json()
        const { name, userId: userID, parentId = null } = body
        if (userID !== userId)
            return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        if (!name || typeof name !== 'string' || name.trim() === '')
            return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
        if (parentId) {
            const [parentFolder] = await db.select().from(files).where(and(
                eq(files.id, parentId),
                eq(files.userId, userId),
                eq(files.isFolder, true)
            ))
            if (!parentFolder)
                return NextResponse.json({ error: 'Parent Folder not Found' }, { status: 401 })
        }
        const [newFolder] = await db.insert(files).values({
            id: v4(),
            fileUrl: '',
            name: name.trim(),
            path: `/folders/${userId}/${v4()}`,
            size: 0,
            type: 'folder',
            userId,
            thumbnailUrl: null,
            parentId,
            isFolder: true
        }).returning()
        return NextResponse.json({ success: true, msg: 'Folder Created Successfully', folder: newFolder })
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: 'Failed to save info to db' }, { status: 500 })
    }
}