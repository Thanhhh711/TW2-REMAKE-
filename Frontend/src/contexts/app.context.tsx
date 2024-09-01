import { createContext, useState } from 'react'
import { User } from '../types/user.type'
import { getAccessTokenFormLS, getProfileFromLS, getRefreshTokenFormLS } from '../utils/auth'

interface AppContextInterface {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  refreshToken: string
  setRefreshToken: React.Dispatch<React.SetStateAction<string>>
  reset: () => void
}

export const getInitialAppContext: () => AppContextInterface = () => ({
  isAuthenticated: Boolean(getAccessTokenFormLS()),
  setIsAuthenticated: () => null,
  profile: getProfileFromLS(),
  setProfile: () => null,
  extendedPurchases: [],
  setExtendedPurchases: () => null,
  refreshToken: getRefreshTokenFormLS() || '',
  setRefreshToken: () => null,
  reset: () => null
})

const initialAppContext = getInitialAppContext()

export const AppContext = createContext<AppContextInterface>(initialAppContext)

export const AppProvider = ({ children, defaultValue = initialAppContext }: { children: React.ReactNode; defaultValue?: AppContextInterface }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(defaultValue.isAuthenticated)
  const [profile, setProfile] = useState<User | null>(defaultValue.profile)
  const [refreshToken, setRefreshToken] = useState<string>(initialAppContext.refreshToken)
  const reset = () => {
    setIsAuthenticated(false)

    setProfile(null)
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        profile,
        setProfile,
        refreshToken,
        setRefreshToken,
        reset
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
