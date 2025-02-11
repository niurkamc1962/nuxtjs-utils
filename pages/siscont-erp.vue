<template>
  <div>
    <h1>Mostrara las tablas de Siscont para ser importadas a ERPNext</h1>
    <div class="q-pa-md">
      <q-table
        title="Tablas SQL Server"
        flat
        bordered
        :rows="rows"
        :columns="columns"
        row-key="name"
        :pagination="initialPagination"
        :class="{
          'bg-gray-800 text-white': $colorMode.value === 'dark',
          'bg-white': $colorMode.value === 'light',
        }"
        class="rounded-lg shadow-lg"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useColorMode } from "#imports";
import { useApiUrlStore } from "#imports";
import { ref, onMounted, computed } from "vue";
import { useQuasar } from "quasar";

const colorMode = useColorMode();
const apiUrlStore = useApiUrlStore();
const $q = useQuasar();

interface TableRow {
  name: string;
}

const rows = ref([]);
const columns = ref([
  {
    name: "name",
    label: "Tabla",
    field: "name",
    align: "left",
    sortable: true,
  },
]);
const totalTables = ref(0);

const initialPagination = {
  sortBy: "name",
  descending: false,
  page: 1,
  rowsPerPage: 10,
};

const fetchTables = async () => {
  try {
    const response = await fetch(`${apiUrlStore.fastApiUrl}/tables`);
    if (!response.ok) {
      throw new Error("Error al obtener las tablas");
    }
    const data = await response.json();
    rows.value = data.tables.map((table) => ({ name: table })); // mapeando los nombres de las tablas a filas
    console.log(rows.value);
    totalTables.value = data.tables.length; // Usamos la longitud del array para el total
  } catch (error) {
    console.error("Error fetching tables: ", error);
  }
};

onMounted(() => {
  fetchTables();
});

const labelColor = computed(() => {
  return colorMode.value === "dark" ? "white" : "gray-9";
});
</script>

<style></style>
