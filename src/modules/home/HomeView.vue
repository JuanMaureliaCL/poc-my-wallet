<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { SignOutButton } from "@clerk/vue";
import { useMovementsStore } from "@/stores/movements";
import type { NewMovement, MovementType } from "@/types/movement";

const store = useMovementsStore();

// ─── Month navigation ────────────────────────────────────────────────
function parseMonth(str: string) {
  const [y, m] = str.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function formatMonthLabel(str: string) {
  const d = parseMonth(str);
  return d.toLocaleString("es-CL", { month: "long", year: "numeric" });
}

function offsetMonth(str: string, delta: number): string {
  const d = parseMonth(str);
  d.setMonth(d.getMonth() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function todayMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const isCurrentMonth = computed(() => store.currentMonth === todayMonth());

function prevMonth() {
  store.fetchMovements(offsetMonth(store.currentMonth, -1));
}
function nextMonth() {
  if (!isCurrentMonth.value)
    store.fetchMovements(offsetMonth(store.currentMonth, 1));
}

// ─── Currency format ─────────────────────────────────────────────────
function fmt(n: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Add movement modal ───────────────────────────────────────────────
const showModal = ref(false);
const saving = ref(false);

const form = ref({
  type: "gasto_variable" as MovementType,
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  category: "",
  is_canje: false,
  cuota_current: "",
  cuota_total: "",
});

function resetForm() {
  form.value = {
    type: "gasto_variable",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "",
    is_canje: false,
    cuota_current: "",
    cuota_total: "",
  };
}

async function submitForm() {
  if (!form.value.description || form.value.amount === "") return;
  saving.value = true;

  const payload: NewMovement = {
    type: form.value.type,
    description: form.value.description,
    amount: form.value.is_canje ? 0 : Number(form.value.amount),
    date: form.value.date,
    category: form.value.category || undefined,
    is_canje: form.value.is_canje,
    is_confirmed: false,
    cuota_current: form.value.cuota_current
      ? Number(form.value.cuota_current)
      : undefined,
    cuota_total: form.value.cuota_total
      ? Number(form.value.cuota_total)
      : undefined,
    month: store.currentMonth,
  };

  await store.addMovement(payload);
  saving.value = false;
  showModal.value = false;
  resetForm();
}

// ─── Init ─────────────────────────────────────────────────────────────
onMounted(() => store.fetchMovements());
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-4 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex justify-end mb-2">
      <SignOutButton>
        <button
          class="text-sm text-muted-foreground hover:text-foreground px-3 py-1 rounded border border-border hover:bg-muted"
        >
          Salir
        </button>
      </SignOutButton>
    </div>

    <!-- Month navigation -->
    <div class="flex items-center justify-center gap-4 mb-6">
      <button
        @click="prevMonth"
        class="px-3 py-1 rounded border border-border hover:bg-muted"
      >
        ←
      </button>
      <h1 class="text-xl font-semibold capitalize w-44 text-center">
        {{ formatMonthLabel(store.currentMonth) }}
      </h1>
      <button
        @click="nextMonth"
        :disabled="isCurrentMonth"
        class="px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-30"
      >
        →
      </button>
    </div>

    <!-- Saldo disponible -->
    <div class="rounded-xl border border-border p-6 mb-6 text-center">
      <p class="text-sm text-muted-foreground mb-1">Saldo Disponible</p>
      <p
        class="text-5xl font-bold mb-4"
        :class="
          store.saldoDisponible >= 0 ? 'text-green-600' : 'text-destructive'
        "
      >
        {{ fmt(store.saldoDisponible) }}
      </p>
      <div class="flex justify-center gap-6 text-sm text-muted-foreground">
        <span
          >Abonos:
          <strong class="text-foreground">{{
            fmt(store.totalAbonos)
          }}</strong></span
        >
        <span
          >Cuotas:
          <strong class="text-foreground">{{
            fmt(store.totalCuotas)
          }}</strong></span
        >
        <span
          >Variables:
          <strong class="text-foreground">{{
            fmt(store.totalVariables)
          }}</strong></span
        >
      </div>
    </div>

    <!-- Add button -->
    <div class="mb-6">
      <button
        v-if="isCurrentMonth"
        @click="showModal = true"
        class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
      >
        + Agregar movimiento
      </button>
      <p v-else class="text-sm text-muted-foreground italic">
        Modo historial — solo lectura
      </p>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center text-muted-foreground py-8">
      Cargando...
    </div>

    <!-- 4 sections grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Abonos Reales -->
      <section class="rounded-xl border border-border p-4">
        <h2 class="font-semibold mb-3 flex justify-between">
          <span>Abonos Reales</span>
          <span class="text-green-600">{{
            fmt(store.abonosReales.reduce((a, m) => a + Number(m.amount), 0))
          }}</span>
        </h2>
        <ul class="space-y-2">
          <li
            v-for="m in store.abonosReales"
            :key="m.id"
            class="flex items-center justify-between text-sm"
          >
            <span>{{ m.description }}</span>
            <div class="flex items-center gap-2">
              <span class="text-green-600 font-medium">{{
                fmt(Number(m.amount))
              }}</span>
              <button
                v-if="isCurrentMonth"
                @click="store.deleteMovement(m.id)"
                class="text-muted-foreground hover:text-destructive text-xs"
              >
                ✕
              </button>
            </div>
          </li>
          <li
            v-if="!store.abonosReales.length"
            class="text-muted-foreground text-sm"
          >
            Sin abonos reales
          </li>
        </ul>
      </section>

      <!-- Abonos Proyectados -->
      <section class="rounded-xl border border-border p-4">
        <h2 class="font-semibold mb-3 flex justify-between">
          <span>Abonos Proyectados</span>
          <span class="text-blue-500">{{
            fmt(
              store.abonosProyectados.reduce((a, m) => a + Number(m.amount), 0),
            )
          }}</span>
        </h2>
        <ul class="space-y-2">
          <li
            v-for="m in store.abonosProyectados"
            :key="m.id"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-muted-foreground italic">{{
              m.description
            }}</span>
            <div class="flex items-center gap-2">
              <span class="text-blue-500 font-medium">{{
                fmt(Number(m.amount))
              }}</span>
              <button
                v-if="isCurrentMonth"
                @click="store.confirmProyectado(m.id)"
                class="text-xs px-2 py-0.5 rounded border border-blue-400 text-blue-500 hover:bg-blue-50"
              >
                ✓
              </button>
              <button
                v-if="isCurrentMonth"
                @click="store.deleteMovement(m.id)"
                class="text-muted-foreground hover:text-destructive text-xs"
              >
                ✕
              </button>
            </div>
          </li>
          <li
            v-if="!store.abonosProyectados.length"
            class="text-muted-foreground text-sm"
          >
            Sin proyectados pendientes
          </li>
        </ul>
      </section>

      <!-- Cuotas Fijas -->
      <section class="rounded-xl border border-border p-4">
        <h2 class="font-semibold mb-3 flex justify-between">
          <span>Cuotas Fijas</span>
          <span class="text-destructive">{{ fmt(store.totalCuotas) }}</span>
        </h2>
        <ul class="space-y-2">
          <li
            v-for="m in store.cuotasFijas"
            :key="m.id"
            class="flex items-center justify-between text-sm"
          >
            <span>
              {{ m.description }}
              <span
                v-if="m.cuota_current && m.cuota_total"
                class="text-muted-foreground text-xs ml-1"
                >({{ m.cuota_current }}/{{ m.cuota_total }})</span
              >
            </span>
            <div class="flex items-center gap-2">
              <span class="text-destructive font-medium">{{
                fmt(Number(m.amount))
              }}</span>
              <button
                v-if="isCurrentMonth"
                @click="store.deleteMovement(m.id)"
                class="text-muted-foreground hover:text-destructive text-xs"
              >
                ✕
              </button>
            </div>
          </li>
          <li
            v-if="!store.cuotasFijas.length"
            class="text-muted-foreground text-sm"
          >
            Sin cuotas fijas
          </li>
        </ul>
      </section>

      <!-- Gastos Variables -->
      <section class="rounded-xl border border-border p-4">
        <h2 class="font-semibold mb-3 flex justify-between">
          <span>Gastos Variables</span>
          <span class="text-destructive">{{ fmt(store.totalVariables) }}</span>
        </h2>
        <ul class="space-y-2">
          <li
            v-for="m in store.gastosVariables"
            :key="m.id"
            class="flex items-center justify-between text-sm"
          >
            <span
              :class="m.is_canje ? 'line-through text-muted-foreground' : ''"
            >
              {{ m.description }}
              <span v-if="m.category" class="text-xs text-muted-foreground ml-1"
                >· {{ m.category }}</span
              >
            </span>
            <div class="flex items-center gap-2">
              <span
                :class="
                  m.is_canje
                    ? 'text-muted-foreground line-through'
                    : 'text-destructive font-medium'
                "
              >
                {{ m.is_canje ? "Canje" : fmt(Number(m.amount)) }}
              </span>
              <button
                v-if="isCurrentMonth"
                @click="store.toggleCanje(m.id)"
                :title="m.is_canje ? 'Quitar canje' : 'Marcar como canje'"
                class="text-muted-foreground hover:text-foreground text-xs"
              >
                ★
              </button>
              <button
                v-if="isCurrentMonth"
                @click="store.deleteMovement(m.id)"
                class="text-muted-foreground hover:text-destructive text-xs"
              >
                ✕
              </button>
            </div>
          </li>
          <li
            v-if="!store.gastosVariables.length"
            class="text-muted-foreground text-sm"
          >
            Sin gastos variables
          </li>
        </ul>
      </section>
    </div>
  </div>

  <!-- Add movement modal -->
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-background rounded-xl border border-border p-6 w-full max-w-md"
      >
        <h2 class="font-semibold text-lg mb-4">Agregar movimiento</h2>

        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Type -->
          <div>
            <label class="text-sm text-muted-foreground block mb-1">Tipo</label>
            <select
              v-model="form.type"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="gasto_variable">Gasto Variable</option>
              <option value="cuota_fija">Cuota Fija</option>
              <option value="abono_real">Abono Real</option>
              <option value="abono_proyectado">Abono Proyectado</option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="text-sm text-muted-foreground block mb-1"
              >Descripción</label
            >
            <input
              v-model="form.description"
              required
              placeholder="ej: Jetsmart"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <!-- Amount -->
          <div>
            <label class="text-sm text-muted-foreground block mb-1"
              >Monto ($)</label
            >
            <input
              v-model="form.amount"
              type="number"
              min="0"
              required
              :disabled="form.is_canje"
              placeholder="0"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-40"
            />
          </div>

          <!-- Date -->
          <div>
            <label class="text-sm text-muted-foreground block mb-1"
              >Fecha</label
            >
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <!-- Category (only for gasto_variable) -->
          <div v-if="form.type === 'gasto_variable'">
            <label class="text-sm text-muted-foreground block mb-1"
              >Categoría</label
            >
            <input
              v-model="form.category"
              placeholder="ej: Comida, Transporte..."
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <!-- Cuota fields (only for cuota_fija) -->
          <div v-if="form.type === 'cuota_fija'" class="flex gap-2">
            <div class="flex-1">
              <label class="text-sm text-muted-foreground block mb-1"
                >Cuota actual</label
              >
              <input
                v-model="form.cuota_current"
                type="number"
                min="1"
                placeholder="2"
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="flex-1">
              <label class="text-sm text-muted-foreground block mb-1"
                >Total cuotas</label
              >
              <input
                v-model="form.cuota_total"
                type="number"
                min="1"
                placeholder="3"
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <!-- Is canje (only for gasto_variable) -->
          <label
            v-if="form.type === 'gasto_variable'"
            class="flex items-center gap-2 text-sm cursor-pointer"
          >
            <input v-model="form.is_canje" type="checkbox" class="rounded" />
            <span>Es canje de puntos (monto $0)</span>
          </label>

          <div class="flex gap-2 pt-2">
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {{ saving ? "Guardando..." : "Guardar" }}
            </button>
            <button
              type="button"
              @click="
                showModal = false;
                resetForm();
              "
              class="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
