<template>
  <div
    v-if="!apiUrlStore.apiUrl"
    class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]"
  >
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[350px] gap-6">
        <div class="grid gap-2 text-center">
          <h1 class="text-2xl font-bold text-gray-900">
            Configuración Inicial
          </h1>
          <p class="text-gray-600">
            Ingresa la URL de la API y el nombre de la aplicacion.
          </p>
        </div>
        <q-form @submit.prevent="handleSetApiUrl" class="grid gap-4">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <q-input
                v-model="inputApiUrl"
                label="URL de la API"
                hint="Ej: http://mi-api.local:8000"
                :rules="[(val) => !!val || 'La URL es requerida']"
                autocomplete="off"
              />
              <q-input
                v-model="inputAppName"
                label="Nombre de la Aplicación"
                hint="Ej: frappe_nuxt_app"
                :rules="[
                  (val) => !!val || 'El nombre de la aplicación es requerido',
                ]"
                autocomplete="off"
              />
            </div>
            <!-- Mostrando mensaje de error -->
            <div v-if="errorMessage" class="text-negative">
              {{ errorMessage }}
            </div>
            <q-btn
              class="w-full glossy"
              rounded
              color="primary"
              type="submit"
              label="Guardar y Continuar"
            />
          </div>
        </q-form>
      </div>
    </div>
    <div>
      <NuxtImg src="erp.jpg" />
    </div>
  </div>

  <div
    v-else
    class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]"
  >
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[350px] gap-6">
        <div class="grid gap-2 text-center">
          <h1 class="text-2xl font-bold text-gray-900">
            Teclee las Credenciales
          </h1>
        </div>
        <q-form @submit.prevent="handleLogin" class="grid gap-4">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <q-input v-model="username" label="E-mail" />
              <q-input v-model="password" type="password" label="Password" />
            </div>
            <!-- Mostrando mensaje de error -->
            <div v-if="errorMessage" class="text-negative">
              {{ errorMessage }}
            </div>
            <q-btn
              class="w-full glossy"
              rounded
              color="primary"
              type="submit"
              label="Iniciar Sesion"
            />
          </div>
        </q-form>
      </div>
    </div>
    <div>
      <NuxtImg src="erp.jpg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { ref } from "vue";
import { useApiUrlStore } from "~/stores/apiUrlStore";
import { useAuthStore } from "~/stores/authStore";

const $q = useQuasar();
const apiUrlStore = useApiUrlStore();
const authStore = useAuthStore();

definePageMeta({
  layout: "auth",
});

const inputApiUrl = ref("");
const inputAppName = ref("");
const username = ref("");
const password = ref("");
const errorMessage = ref<string | null>(null);

// funcion para validar la URL
const validateUrl = (url: string): boolean => {
  const urlPattern = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})(:\d+)?\/?$/;
  if (!urlPattern.test(url)) {
    errorMessage.value =
      "La URL debe comenzar con http:// o https:// y tener un formato válido. Ejemplo: http://mi-api.com:8000";
    return false;
  }
  errorMessage.value = null;
  return true;
};

// Función para verificar la disponibilidad de la API
const checkApiAvailability = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}`); // Endpoint de verificación
    return response.ok; // Devuelve true si la respuesta es exitosa (status 200-299)
  } catch (error) {
    return false; // Devuelve false si hay un error
  }
};

// Manejar la configuración de la URL de la API
const handleSetApiUrl = async () => {
  if (!validateUrl(inputApiUrl.value)) {
    return; // Detén el proceso si la URL no es válida
  }

  if (!inputAppName.value) {
    errorMessage.value = "El nombre de la aplicacion es REQUERIDO";
  }
  const isApiAvailable = await checkApiAvailability(inputApiUrl.value);
  if (!isApiAvailable) {
    errorMessage.value =
      "La API no está disponible. Verifica la URL e intenta de nuevo.";
    return;
  }

  apiUrlStore.setApiUrl(inputApiUrl.value); // Guarda la URL en el store
  apiUrlStore.setAppName(inputAppName.value); // Guarda el nombre de la app en el store
  errorMessage.value = null;
};

// Manejar el inicio de sesión
const handleLogin = async () => {
  const response = await authStore.login(username.value, password.value);

  // console.log("RESPONSE: ", response.message.success_key);

  if (response.message.success_key === 1) {
    $q.notify({
      color: "blue-4",
      textColor: "white",
      icon: "cloud_done",
      message: "Autenticado correctamente",
    });
    await navigateTo("/main");
  } else {
    $q.notify({
      color: "red-4",
      textColor: "white",
      icon: "cloud_done",
      message: "ERROR, Usuario o password erroneo",
    });
    // limpiando los campos del formulario
    username.value = "";
    password.value = "";
  }
};
</script>
