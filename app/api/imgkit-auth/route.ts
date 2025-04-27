import { auth } from '@clerk/nextjs/server'
import ImageKit from 'imagekit'
import { NextResponse } from 'next/server'

const imgKit = new ImageKit({
    privateKey: process.env.IMGKIT_PRIVATE_KEY!,
    publicKey: process.env.NEXT_PUBLIC_IMGKIT_PUBLIC_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMGKIT_URL!
})

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId)
            return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        const authParams = imgKit.getAuthenticationParameters()
        return NextResponse.json(authParams)
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: 'Failed to generate Authentication Parameters for imgkit' }, { status: 500 })
    }
}