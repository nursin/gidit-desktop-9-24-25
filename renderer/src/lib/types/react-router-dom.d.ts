import type { AnchorHTMLAttributes, FC, ReactNode } from 'react'

declare module 'react-router-dom' {
  export interface BrowserRouterProps {
    children?: ReactNode
  }

  export const BrowserRouter: FC<BrowserRouterProps>

  export interface RoutesProps {
    children?: ReactNode
  }

  export const Routes: FC<RoutesProps>

  export interface RouteProps {
    path?: string
    element?: ReactNode
  }

  export const Route: FC<RouteProps>

  export interface NavigateProps {
    to: string
    replace?: boolean
  }

  export const Navigate: FC<NavigateProps>

  export interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    to: string
    end?: boolean
    className?: string | ((props: { isActive: boolean; isPending: boolean }) => string)
    children?: ReactNode
  }

  export const NavLink: FC<NavLinkProps>
}
