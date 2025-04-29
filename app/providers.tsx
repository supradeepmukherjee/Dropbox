'use client'
import { ReactNode } from "react"
import { ThemeProviderProps } from 'next-themes' // check if type has to be imported
import { ImageKitProvider } from 'imagekitio-next'
import { HeroUIProvider } from "@heroui/react"

const Providers = ({ children }: ProviderProps) => (
    <ImageKitProvider
        publicKey={process.env.NEXT_PUBLIC_IMGKIT_PUBLIC_KEY}
        urlEndpoint={process.env.NEXT_PUBLIC_IMGKIT_URL}
        authenticator={async () => {
            try {
                const res = await fetch('/api/imgkit-auth')
                const data = await res.json()
                return data
            } catch (err) {
                console.log(err)
                throw err
            }
        }}
    >
        <HeroUIProvider>
            {children}
        </HeroUIProvider>
    </ImageKitProvider>
)

export interface ProviderProps {
    children: ReactNode
    themeProp?: ThemeProviderProps
}

export default Providers