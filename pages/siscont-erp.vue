<template>
  <div>
    <h1>Listado de las tablas de Siscont</h1>
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
        :filter="filter"
        class="rounded-lg shadow-lg"
      >
        <!-- Botones para las acciones en las filas-->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              rounded
              color="primary"
              label="Ver Estructura"
              @click="showStructure(props.row.name)"
              size="sm"
            />

            <q-btn
              rounded
              color="secondary"
              label="Obtener datos JSON"
              @click="showJsonData(props.row.name)"
              size="sm"
            />
          </q-td>
        </template>
        <template v-slot:top-right>
          <q-input
            borderless
            dense
            debounce="400"
            v-model="filter"
            placeholder="Buscar tabla ..."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
      </q-table>
    </div>
    <!-- <div class="q-mt-md">Selected: {{ JSON.stringify(selected) }}</div> -->

    <!-- Dialog que muestra la estructura de la tabla-->
    <q-dialog v-model="structureDialogVisible">
      <q-card>
        <q-card-section>
          <div class="font-medium text-black text-md">
            Estructura de la tabla: {{ selectedTableName }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-table
            v-if="tableStructure.length > 0"
            flat
            bordered
            :rows="tableStructure"
            :columns="structureColumns"
            row-key="column_name"
            hide-pagination
            :rows-per-page-options="[0]"
          />
          <div v-else>Cargando estructura de la tabla ...</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Cerrar"
            color="primary"
            @click="structureDialogVisible = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog que muestra los datos en formato JSON-->
    <q-dialog v-model="jsonDialogVisible">
      <q-card style="max-width: 80vw">
        <q-card-section>
          <div class="font-medium text-black text-md">
            Datos en formato JSON de : {{ selectedTableName }}
          </div>
        </q-card-section>
        <q-card-section style="max-height: 50vh" class="scroll">
          <pre>
            {{ jsonData }}
          </pre>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
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

const filter = ref("");
const selected = ref<TableRow[]>([]);
const rows = ref<TableRow[]>([]);
const columns = ref([
  {
    name: "name",
    label: "Tabla",
    field: "name",
    align: "left",
    sortable: true,
  },
  {
    name: "actions",
    label: "Acciones",
    field: "actions",
    align: "center",
  },
]);
const totalTables = ref(0);

const initialPagination = {
  sortBy: "name",
  descending: false,
  page: 1,
  rowsPerPage: 10,
};

// variables para los dialogs (estructura y json)
const structureDialogVisible = ref(false);
const jsonDialogVisible = ref(false);
const selectedTableName = ref("");
const tableStructure = ref([]);
const jsonData = ref({});

const structureColumns = ref([
  {
    name: "column_name",
    label: "Columna",
    field: "column_name",
    align: "left",
    sortable: true,
  },
  {
    name: "data_type",
    label: "Tipo de datos",
    field: "data_type",
    align: "left",
    sortable: true,
  },
  {
    name: "max_length",
    label: "Longitud",
    field: "max_length",
    align: "left",
    sortable: true,
  },
  {
    name: "is_nullable",
    label: "Es Nulo",
    field: "is_nullable",
    align: "left",
    sortable: true,
  },
]);

const structurePagination = {
  sortBy: "column_name",
  descending: false,
  page: 1,
  rowsPerPage: 10,
};

// Funcion para seleccionar los nombres de las tablas con la API de fastApi /tables
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

// funcion para obtener la estructura de la tabla seleccionada con la API de fastApi
const fetchTableStructure = async (tableName: string) => {
  // console.log("En fetchTableStructure: ", tableName);
  try {
    const response = await fetch(
      `${apiUrlStore.fastApiUrl}/table-structure/${tableName}`
    );
    if (!response.ok) {
      throw new Error("Error al obtener la estructura de la tabla");
    }
    const data = await response.json();
    tableStructure.value = data.columns; // asignando estructura de la tabla
  } catch (error) {
    console.error("Error fetching table structure: ", error);
    $q.notify({
      type: "negative",
      message: "Error al obtener la estructura de la tabla",
    });
  }
};

// Funcion para obtener los datos de la tabla en formato JSON segun la API de fastapi
const fetchTableData = async (tableName: string) => {
  try {
    const response = await fetch(
      `${apiUrlStore.fastApiUrl}/table-data/${tableName}`
    );
    if (!response.ok) {
      throw new Error("Error al obtener la información de la tabla");
    }
    const data = await response.json();
    console.log("JSON: ", data);
    jsonData.value = data;
  } catch (error) {
    console.error("Error fetching table data: ", error);
    $q.notify({
      type: "negative",
      message: "Error al obtener la información de la tabla",
    });
  }
};

// Funcion que muestra la estructura de la tabla
const showStructure = async (tableName: string) => {
  selectedTableName.value = tableName;
  structureDialogVisible.value = true;
  await fetchTableStructure(tableName);
};

// Funcion para mostrar los datos en formato JSON
const showJsonData = async (tableName: string) => {
  selectedTableName.value = tableName;
  jsonDialogVisible.value = true;
  await fetchTableData(tableName);
};

// funcion que se ejecuta al seleccionar fila
// const onRowSelected = (selectedRows: TableRow[]) => {
//   if (selectedRows.length > 0) {
//     selectedTableName.value = selectedRows[0].name; // obteniendo el nombre de la tabla seleccionada
//     // obteniendo la estructura de la tabla y esperando el resultado antes de mostrarlo
//     dialogVisible.value = true; // mostrando dialog
//     fetchTableStructure(selectedTableName.value);
//   } else {
//     dialogVisible.value = false; // escondiendo el dialog
//   }
// };

onMounted(() => {
  fetchTables();
});

const labelColor = computed(() => {
  return colorMode.value === "dark" ? "white" : "gray-9";
});
</script>

<style></style>
