// Utilidades de texto sin dependencias del navegador (las usan los diccionarios de idioma y el servidor).

/** Nombre a mitad de frase: baja sólo la inicial y respeta siglas («CCTV y videovigilancia», «WiFi empresarial»). */
export const lowerFirst = (name: string) => (/[A-Z].*[A-Z]/.test(name.split(' ')[0]) ? name : name.charAt(0).toLowerCase() + name.slice(1))
