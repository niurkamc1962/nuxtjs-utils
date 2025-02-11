<template>
  <div :class="{ 'dark-mode': $colorMode.value === 'dark' }">
    <div class="text-2xl">Archivos PDF Clientes - Proveedores</div>
    <div class="p-4">
      <div class="mb-6">
        <q-form ref="formRef" @submit="handleFileUpload" class="q-gutter-md">
          <!-- contenedor flex para q-file y q-btn-->
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <q-file
                style="max-width: 500px"
                v-model="pdfFile"
                label="Archivo PDF (max. size 5MB)"
                accept=".pdf"
                filled
                max-file-size="40000000"
                @rejected="onRejected"
                :label-color="labelColor"
                :class="{
                  'text-white bg-gray-800 border-gray-600':
                    $colorMode.value === 'dark',
                  'text-gray-800 border-blue-700': $colorMode.value === 'light',
                }"
                :rules="[
                  (val) => !!val || 'Por favor, selecciona un archivo',
                  (val) =>
                    val?.type === 'application/pdf' ||
                    'El archivo debe ser un PDF',
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>
            <div class="ml-2">
              <!-- Boton para ejecutar la accion de subir fichero -->
              <q-btn
                type="submit"
                color="primary"
                label="Subir archivo"
                :disabled="!pdfFile"
              />
            </div>
          </div>
        </q-form>
      </div>
      <div class="q-pa-md">
        <q-table
          :rows="pdfFiles"
          :columns="columns"
          row-key="name"
          :visible-columns="visibleColumns"
          :row-class="getRowClass"
          :class="{
            'bg-gray-800 text-white': $colorMode.value === 'dark',
            'bg-white': $colorMode.value === 'light',
          }"
          class="rounded-lg shadow-lg"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                color="primary"
                icon="visibility"
                @click="previewPdf(props.row)"
              >
                <q-tooltip>Ver PDF</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="secondary"
                icon="archive"
                @click="processPdf(props.row)"
              >
                <q-tooltip>Procesar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click="deletePdf(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>

      <q-dialog v-model="previewDialog" full-width>
        <q-card>
          <q-card-section class="items-center row q-pb-none">
            <div class="text-h6">{{ selectedFile?.archivo_pdf }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <!-- <iframe
              v-if="selectedFile"
              :src="fullPdfUrl"
              width="100%"
              height="600"
              frameborder="0"
            ></iframe> -->
            <pdf-frame :src="fullPdfUrl" width="100%" height="600px" />
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { QForm, useQuasar } from "quasar";
import { useColorMode } from "#imports";
import { useAuthStore } from "~/stores/authStore";
import { useApiUrlStore } from "~/stores/apiUrlStore";

// Usar el store de la URL de la API
const apiUrlStore = useApiUrlStore();

// URL dinámica para la subida de archivos
const uploadUrl = computed(() => {
  return `${apiUrlStore.apiUrl}/api/method/${apiUrlStore.appName}.api.pdf.upload_pdf`;
});

// Computada para configurar la URL completa del PDF a visualizar
const fullPdfUrl = computed(() => {
  if (selectedFile.value) {
    return `${apiUrlStore.apiUrl}${selectedFile.value.ruta_archivo}`;
  }
  return "";
});

const $q = useQuasar();
const colorMode = useColorMode();
const authStore = useAuthStore();

// Computada para el color de la label en q-file
const labelColor = computed(() => {
  return colorMode.value === "dark" ? "white" : "gray-9";
});

interface PdfFile {
  name: string;
  size: number;
  archivo_pdf: string;
  ruta_archivo: string;
  estado_archivo: string;
}

interface TableColumn {
  name: string;
  required?: boolean;
  label: string;
  align?: string;
  field: ((row: PdfFile) => string) | string;
  sortable?: boolean;
  format?: (val: number) => string;
}

const pdfFile = ref<File | null>(null);
const pdfFiles = ref<PdfFile[]>([]);
const selected = ref<PdfFile[]>([]);
const previewDialog = ref<boolean>(false);
const selectedFile = ref<PdfFile | null>(null);

const formRef = ref<QForm | null>(null);

// Columnas de la tabla
const columns: TableColumn[] = [
  // {
  //   name: "name",
  //   required: true,
  //   label: "Nombre del registro",
  //   align: "left",
  //   field: (row: PdfFile) => row.name,
  //   sortable: true,
  // },
  {
    name: "archivo_pdf",
    label: "Nombre del archivo",
    align: "left",
    field: (row: PdfFile) => row.archivo_pdf,
    sortable: true,
  },
  {
    name: "ruta_archivo",
    label: "Ruta del archivo",
    align: "left",
    field: (row: PdfFile) => row.ruta_archivo,
    sortable: true,
  },
  {
    name: "estado_archivo",
    label: "Estado del archivo",
    align: "left",
    field: (row: PdfFile) => row.estado_archivo,
    sortable: true,
  },
  {
    name: "actions",
    label: "Acciones",
    align: "center",
    field: "actions",
  },
];

// definiendo las columnas visibles para la tabla
const visibleColumns = ref<string[]>([
  "archivo_pdf",
  "estado_archivo",
  "actions",
]);

// Función para obtener el token de autenticación
function getAuthToken() {
  const authString = localStorage.getItem("auth");
  if (!authString)
    throw new Error("No se encontró el valor de auth en localStorage.");

  const authObject = JSON.parse(authString);
  const apiKey = authObject.loginError.api_key;
  const apiSecret = authObject.loginError.api_secret;
  return `${apiKey}:${apiSecret}`;
}

// Función para chequear el size del archivo y mostrar mensaje de rechazados
function onRejected(rejectedEntries: any[]) {
  rejectedEntries.forEach((entry) => {
    if (entry.failedPropValidation === "max-file-size") {
      $q.notify({
        type: "negative",
        message: `El archivo "${entry.file.name}" excede el tamaño máximo permitido de 5 MB.`,
      });
    }
  });
}

// Función para el tratamiento de subir el archivo PDF a traves de la API de frappe
async function handleFileUpload() {
  if (!pdfFile.value) {
    $q.notify({
      type: "negative",
      message: "Por favor, selecciona un archivo PDF.",
    });
    return;
  }

  const formData = new FormData();
  formData.append("file", pdfFile.value);

  try {
    const token = getAuthToken();

    const response = await fetch(
      `${apiUrlStore.apiUrl}/api/method/upload_file`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Error al subir el archivo");
    }

    const result = await response.json();
    console.log("Respuesta del servidor: ", result);

    // Registrando el archivo pdf en el doctype "Archivos PDF" creado en Frappe
    const uploadResponse = await fetch(
      `${apiUrlStore.apiUrl}/api/method/${apiUrlStore.appName}.api.pdf.upload_pdf`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: result.message.file_url,
          file_name: pdfFile.value.name,
          is_private: 0,
        }),
      }
    );

    if (!uploadResponse.ok) {
      throw new Error("Error al registrar el archivo en el doctype");
    }

    const uploadResult = await uploadResponse.json();
    console.log("Archivo registrado en el doctype: ", uploadResult);

    $q.notify({
      type: "positive",
      message: "Archivo subido correctamente",
    });

    // Limpiando el campo del archivo en el formulario
    pdfFile.value = null;

    // Actualizar la lista de archivos PDF
    await fetchPdfFiles();
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Error, no se pudo subir el archivo",
    });
    console.error("Error al subir el archivo pdf:", error);
  } finally {
    // reiniciando el estado del formulario
    resetForm();
  }
}

// funcion para reiniciar el formulario
function resetForm() {
  pdfFile.value = null;
  // reiniciando el formulario completo
  if (formRef.value) {
    formRef.value.resetValidation();
  }
}

// Funcion que obtiene los archivos PDf del doctype y los muestra en la tabla
async function fetchPdfFiles() {
  try {
    const token = getAuthToken();

    // Llamar al método de Frappe para obtener los archivos PDF
    const response = await fetch(
      `${apiUrlStore.apiUrl}/api/method/${apiUrlStore.appName}.api.pdf.get_pdf_files`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.log("Error al obtener los archivos del doctype");
      throw new Error("Error al obtener los archivos PDF");
    }

    const result = await response.json();
    pdfFiles.value = result.message; // Asignar los archivos a la lista
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Error al obtener los archivos PDF",
    });
    console.error("Error al obtener los archivos PDF:", error);
  }
}

function previewPdf(row: PdfFile) {
  selectedFile.value = row; // asigna el archivo seleccionado
  previewDialog.value = true;
}

// Funcion para asignar color a los que tienen estado Pendientes
function getRowClass(row: PdfFile) {
  if (row.estado_archivo === "Pendiente") {
    return "bg-yellow";
  } else {
    return "";
  }
}

// Llamar a la función al cargar el componente
onMounted(() => {
  fetchPdfFiles();
});
</script>

<style scoped>
.bg-yellow {
  background-color: rgb(238, 209, 46);
}
</style>
