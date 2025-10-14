/**
 * Extrae el valor de una cookie específica de la cadena de cookies
 * @param cookieHeader - Cadena de cookies del header
 * @param cookieName - Nombre de la cookie a buscar
 * @returns El valor de la cookie o null si no se encuentra
 */
export const extractCookieValue = (cookieHeader: string, cookieName: string): string | null => {
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const targetCookie = cookies.find(c => c.startsWith(`${cookieName}=`));
  
  if (!targetCookie) {
    return null;
  }

  const [, value] = targetCookie.split('=');
  return value || null;
};