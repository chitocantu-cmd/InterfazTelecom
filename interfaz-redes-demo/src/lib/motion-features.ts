// Funciones de animación de motion (animar, salir, hover, al entrar en pantalla). Se descargan aparte, después del
// primer pintado: los componentes `m.*` se dibujan igual sin ellas y empiezan a animar al llegar (App.tsx).
// Sin domMax (layoutId/layout): suma ~30 KB y los indicadores del sitio se resuelven con transiciones CSS.
import { domAnimation } from 'motion/react'

export default domAnimation
