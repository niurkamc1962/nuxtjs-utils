<template>
  <div class="min-h-screen">
    <!-- Top Navigation Bar -->
    <header class="bg-gray-500 shadow">
      <div class="px-4 mx-auto sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="text-2xl font-semibold">
            <NuxtLink to="/main"> ERP-NUXT-Utilities </NuxtLink>
          </div>
          <div class="flex items-center gap-4">
            <div v-if="authStore.user">
              {{ authStore.user.username }}
            </div>
            <q-btn dense flat @click="changeColor">
              <div class="p-2 m-1">
                {{ $colorMode.value === "dark" ? "☀️" : "🌙" }}
              </div>
            </q-btn>
            <q-btn-dropdown dense flat label="Menu">
              <q-list>
                <q-item
                  v-for="(item, index) in flatUserMenuItems"
                  :key="index"
                  clickable
                  @click="goTo(item.path)"
                >
                  <q-item-section>
                    <q-item-label>
                      {{ item.title }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </div>
    </header>

    <div class="flex h-[calc(100vh-64px)]">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-200 border-r dark:bg-gray-800">
        <nav class="flex flex-col h-full">
          <div class="px-4 grow">
            <div class="grid gap-2 mt-4">
              <NuxtLink
                :href="item.path"
                v-for="(item, index) in navigationLinks"
                :key="index"
                :class="[
                  'flex items-center gap-2 px-2 py-1 transition rounded cursor-pointer link',
                  { 'link-active': isActive(item.path) },
                ]"
              >
                <q-icon
                  v-if="item.icon"
                  :name="item.icon"
                  size="30px"
                  :class="{
                    'text-gray-800 dark:text-yellow-200': !isActive(item.path),
                    'text-yellow-200': isActive(item.path),
                  }"
                />
                <span
                  :class="{
                    'text-gray-800 dark:text-yellow-200': !isActive(item.path),
                    'text-yellow-200': isActive(item.path),
                  }"
                >
                  {{ item.title }}
                </span>
              </NuxtLink>
            </div>
          </div>
          <!-- <div class="p-4 border-r">
            <button @click="changeColor">
              {{ $colorMode.value === "dark" ? "☀️" : "🌙" }} Modo
            </button>
          </div> -->
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter(); // importando el router para la navegacion
import { useAuthStore } from "~/stores/authStore";

// Forzando la hidratacion del esto de pinia desde localStorage
const authStore = useAuthStore();
authStore.$hydrate(); // asegurando que se cargue el estado del localStorage

const colorMode = useColorMode();

const changeColor = () => {
  if (colorMode.value === "light") {
    colorMode.preference = "dark";
  } else if (colorMode.value === "dark") {
    colorMode.preference = "light"; // Cambia esto si decides agregar un modo sepia
  } else {
    colorMode.preference = "light";
  }
};

// Funcion que verifica si esta activa la ruta
const isActive = (path: string) => {
  return route.path === path;
};

// Define interfaces de navegacion en la barra lateral
interface NavigationLink {
  title: string;
  icon: string;
  path: string;
}

interface UserMenuItem {
  title: string;
  icon: string;
  path: string;
}

const navigationLinks: NavigationLink[] = [
  {
    title: "Sql Server - Maria DB",
    icon: "import_export",
    path: "/siscont-erp",
  },
  {
    title: "Gestion archivos PDF",
    icon: "picture_as_pdf",
    path: "/procesa-pdf",
  },
  {
    title: "Enviar PDF",
    icon: "mail",
    path: "/adjunto-pdf",
  },
];

const userMenuItems: UserMenuItem[][] = [
  [
    {
      title: "Administración",
      icon: "settings",
      path: "/admin",
    },
    {
      title: "Cerrar Sesión",
      icon: "logout",
      path: "/",
    },
  ],
];

// Aplanar el arreglo de userMenuItems
const flatUserMenuItems = userMenuItems.flat();

// Función para navegar a la ruta correspondiente
const goTo = (path: string) => {
  if (path === "/") {
    // limpiando los datos de autenticacion
    authStore.clearAuthData();
  }
  router.push(path);
};
</script>

<style>
html {
  background-color: white;
  color: black;
  transition: background-color 0.3s, color 0.3s;
}

html.dark {
  background-color: #1a1a1a;
  color: white;
}

.color-mode-container {
  padding: 1rem;
  text-align: center;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  cursor: pointer;
  background: none;
  border: 1px solid currentColor;
  border-radius: 0.5rem;
  margin-right: 1rem;
}

h1 {
  text-align: center;
  margin-top: 2rem;
}
</style>
