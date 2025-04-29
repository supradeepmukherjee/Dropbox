import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

const imgKit = new ImageKit({
    privateKey: process.env.IMGKIT_PRIVATE_KEY!,
    publicKey: process.env.NEXT_PUBLIC_IMGKIT_PUBLIC_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMGKIT_URL!
})

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId)
            return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        const data = await req.formData()
        const file = data.get('file') as File
        const userID = data.get('userID') as string
        const parentId = data.get('parentId') as string || null
        if (userID !== userId)
            return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        if (!file)
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        if (parentId) {
            const [parentFolder] = await db.select().from(files).where(and(
                eq(files.parentId, parentId),
                eq(files.userId, userId),
                eq(files.isFolder, true)
            ))
            if (!parentFolder) return NextResponse.json({ error: 'Parent Folder not found' }, { status: 400 })
        }
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf')
            return NextResponse.json({ error: 'Only images & pdf are supported' }, { status: 400 })
        const buffer = await file.arrayBuffer()
        const fileBuffer = Buffer.from(buffer)
        const originalFileName = file.name
        const res = await imgKit.upload({
            file: fileBuffer,
            fileName: `${v4()}.${originalFileName.split('.').pop()}`,
            folder: parentId ? `/dropbox/${userId}/folder/${parentId}` : `/dropbox/${userId}`,
            useUniqueFileName: false
        })
        const [newFile] = await db.insert(files).values({
            name: originalFileName,
            path: res.filePath,
            size: file.size,
            type: file.type,
            fileUrl: res.url,
            thumbnailUrl: res.thumbnailUrl || null,
            userId,
            parentId,
        }).returning()
        return NextResponse.json(newFile)
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}