import { ReactNode } from "react"
import { ThemeProviderProps } from 'next-themes' // check if type has to be imported

const Providers = ({ children }: ProviderProps) => (
    <h1>
        {children}
    </h1>
)

export interface ProviderProps {
    children: ReactNode
    themeProp?: ThemeProviderProps
}

export default Providers