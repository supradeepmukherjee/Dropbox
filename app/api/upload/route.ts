import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        const body = await req.json()
        console.log(body)
        const { imgKit, userID } = body
        if (userID !== userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        if (!imgKit || !imgKit.url) return NextResponse.json({ error: 'Invalid File Upload Data' }, { status: 401 })
        const [newFile] = await db.insert(files).values({
            name: imgKit.name || 'Untitled',
            path: imgKit.filePath || `/dropbox/${userId}/${imgKit.name}`,
            size: imgKit.size || 0,
            userId,
            type: imgKit.fileType || 'image',
            fileUrl: imgKit.url,
            thumbnailUrl: imgKit.thumbnailUrl || null,
            parentId: null,// default: root level
            isFolder: false,
            isStarred: false,
            isTrashed: false
        }).returning()
        return NextResponse.json(newFile)
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: 'Failed to save info to db' }, { status: 500 })
    }
}