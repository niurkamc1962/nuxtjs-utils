import { useAuthStore } from "~/stores/authStore";
import { useApiUrlStore } from '~/stores/apiUrlStore';

export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore();

    // Usar el store de la URL de la API
    const apiUrlStore = useApiUrlStore();

    // lista de rutas que no necesitan autenticacion
    const publicRoutes = ['/']  // ajustar segun sea necesario

    // si la ruta esta en la lista de publicRoutes no hacer nada
    if (publicRoutes.includes(to.path)) {
        return;  // no hacer nada si ya esta en la pagina de autenticarse
    }

    // verificando si estamos en el cliente antes de acceder al localStorage
    if (import.meta.client) {

        try {
            const authString = localStorage.getItem('auth');

            if (!authString) {
                console.log('No se encontro datos de auth en el localStorage');
                return navigateTo('/')
            }
            const authObject = JSON.parse(authString)
            const username = authObject.loginError.username

            const apiKey = authObject.loginError.api_key
            const apiSecret = authObject.loginError.api_secret

            console.log('username: ', username);
            console.log('apiKey: ', apiKey);
            console.log('apiSecret: ', apiSecret);

            // Si no hay username redirecciona al login
            if (!username) {
                console.log('No se encontro datos del usuario autenticacado')
                return navigateTo('/')
            }

            // Verificando el token si es valido con el backend(opcional)
            // const token = `${authObject.loginError.api_key}: ${authObject.loginError.api_secret}`;
            if (apiKey && apiSecret) {

                const isValid = await verifyToken(apiKey, apiSecret)   //funcion para verificar el token

                if (!isValid) {
                    console.log("TOKEN no valido, Usuario no coincide frontend con backend");
                    authStore.clearAuthData()  //limpiar los datos de la autenticacion
                    return navigateTo('/')
                }
                // si el usuario esta autenticado y el token es valido, no se hace nada
                console.log("Usuario autenticado: ", username)
            }

        } catch (error) {
            console.error('Error al parsear el valor de auth:', error);
        }
    }


    // funcion para verificar el token con el backend (opcional)
    async function verifyToken(apiKey: string, apiSecret: string): Promise<boolean> {
        try {
            const response = await fetch(
                `${apiUrlStore.apiUrl}/api/method/frappe.auth.get_logged_user`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `token ${apiKey}:${apiSecret}`,
                    },
                }
            );

            // Si la respuesta es exitosa, el token es válido
            if (response.ok) {
                const data = await response.json();
                console.log('Usuario autenticado:', data.message);
                return true;
            } else {
                console.error('Error al verificar el token:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return false;
        }
    }

})