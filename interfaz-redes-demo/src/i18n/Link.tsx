// Enlaces internos que conservan el idioma: <Link to="/soluciones"> lleva a /en/soluciones si la página está en inglés.
// Úselos en lugar de los de react-router-dom en todo el sitio.
import { forwardRef } from 'react'
import { Link as RouterLink, Navigate as RouterNavigate, NavLink as RouterNavLink, type LinkProps, type NavigateProps, type NavLinkProps } from 'react-router-dom'
import { useI18n } from '.'

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...rest }, ref) {
  const { lp } = useI18n()
  return <RouterLink ref={ref} to={typeof to === 'string' ? lp(to) : to} {...rest} />
})

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink({ to, ...rest }, ref) {
  const { lp } = useI18n()
  return <RouterNavLink ref={ref} to={typeof to === 'string' ? lp(to) : to} {...rest} />
})

export function Navigate({ to, ...rest }: NavigateProps) {
  const { lp } = useI18n()
  return <RouterNavigate to={typeof to === 'string' ? lp(to) : to} {...rest} />
}
