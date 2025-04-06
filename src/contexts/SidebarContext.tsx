import { createContext, ReactNode, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isAnimating: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
    const [isAnimating, setIsAnimating] = useState<boolean>(false)
    
    const toggleSidebar = () => {
        if (!isAnimating) {
            setIsAnimating(true)
            setIsCollapsed(prev => !prev)
        }
    }
    
    // Установка флага анимации
    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => {
                setIsAnimating(false)
            }, 1000) // Соответствует duration-1000
            
            return () => clearTimeout(timer)
        }
    }, [isAnimating])
    
    const contextValue = {
        isCollapsed,
        toggleSidebar,
        isAnimating
    }
    
    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    )
}

// Хук для использования контекста
export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
} 