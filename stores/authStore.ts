import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApiUrlStore } from './apiUrlStore';

interface User {
  api_key: string;
  api_secret: string;
  username: string;
  email: string;
}

export const useAuthStore = defineStore('auth', () => {
  // Usar el store de la URL de la API
  const apiUrlStore = useApiUrlStore();

  // Estado Inicial
  const user = ref<User | null>(null)
  const loginError = ref<string | null>(null)
  const loading = ref<boolean>(false)

  // accion para iniciar sesion
  const login = async (username: string, password: string) => {
    loading.value = true;
    loginError.value = null;

    try {
      const response = await fetch(`${apiUrlStore.frappeApiUrl}/api/method/${apiUrlStore.appName}.api.auth.login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ usr: username, pwd: password }),
        });

      const data = await response.json();

      // console.log('DATA: ', data);


      // verifica el success_key para determinar si fue exitosa la autenticacion
      if (data.success_key === 1) {
        user.value = data.message;   // guarda los datos del usuario
        // verificando que user.value no sea null antes de acceder a sus propiedades
        console.log('Usuario autenticado: ', user.value);

        // if (user.value) {
        //   localStorage.setItem('apiKey', user.value.api_key);
        //   localStorage.setItem('apiSecret', user.value.api_secret)
        // }
        return { success_key: 1, message: 'Autenticacion exitosa' }
      } else {
        loginError.value = data.message
        return { success_key: 0, message: loginError.value };  // retornando el error
      }
    } catch (error) {
      loginError.value = 'Error en la solicitud, intente de nuevo';
      return { success_key: 0, message: loginError.value };  // retornando el error
    } finally {
      loading.value = false;
    }
  };

  // Accion para guardar los datos de autenticacion
  const setAuthData = (authData: User) => {
    user.value = authData  // gurada los datos en el store
    if (import.meta.client) {
      localStorage.setItem('auth', JSON.stringify(authData)) // guarda los datos en el localStorage
    }
  }

  // Accion para limpiar los datos de autenticacion
  const clearAuthData = () => {
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('auth')
    }
  }

  // Verificar si el usuario esta autenticado
  const isAuthenticated = () => {
    return !!user.value  // devuelve true si el usuario esta autenticado
  }

  // Accion para cerrar sesion
  const logout = () => {
    user.value = null;
    if (import.meta.client) {
      localStorage.removeItem('apiKey');
      localStorage.removeItem('apiSecret');
    }
  };

  return { user, loginError, loading, login, logout, setAuthData, clearAuthData, isAuthenticated };
},
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(), // usando sessionStorage en lugar de localStorage
    }
  });
