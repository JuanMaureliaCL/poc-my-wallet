import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { Movement, NewMovement } from '@/types/movement'

function currentMonthStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export const useMovementsStore = defineStore('movements', {
  state: () => ({
    movements: [] as Movement[],
    loading: false,
    currentMonth: currentMonthStr(),
  }),

  getters: {
    cuotasFijas: (s) => s.movements.filter((m) => m.type === 'cuota_fija'),

    gastosVariables: (s) => s.movements.filter((m) => m.type === 'gasto_variable'),

    abonosReales: (s) =>
      s.movements.filter(
        (m) => m.type === 'abono_real' || (m.type === 'abono_proyectado' && m.is_confirmed),
      ),

    abonosProyectados: (s) =>
      s.movements.filter((m) => m.type === 'abono_proyectado' && !m.is_confirmed),

    totalCuotas(): number {
      return (this.cuotasFijas as Movement[]).reduce((acc, m) => acc + Number(m.amount), 0)
    },

    totalVariables(): number {
      return (this.gastosVariables as Movement[])
        .filter((m) => !m.is_canje)
        .reduce((acc, m) => acc + Number(m.amount), 0)
    },

    totalAbonos(): number {
      return [...(this.abonosReales as Movement[]), ...(this.abonosProyectados as Movement[])].reduce(
        (acc, m) => acc + Number(m.amount),
        0,
      )
    },

    saldoDisponible(): number {
      return (this.totalAbonos as number) - (this.totalCuotas as number) - (this.totalVariables as number)
    },
  },

  actions: {
    async fetchMovements(month?: string) {
      this.loading = true
      const targetMonth = month ?? this.currentMonth
      if (month) this.currentMonth = month

      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .eq('month', targetMonth)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching movements:', error.message)
      } else {
        this.movements = data ?? []
      }

      this.loading = false
    },

    async addMovement(payload: NewMovement) {
      const { data, error } = await supabase
        .from('movements')
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error('Error adding movement:', error.message)
      } else if (data) {
        this.movements.push(data)
      }
    },

    async deleteMovement(id: string) {
      const { error } = await supabase.from('movements').delete().eq('id', id)

      if (error) {
        console.error('Error deleting movement:', error.message)
      } else {
        this.movements = this.movements.filter((m) => m.id !== id)
      }
    },

    async toggleCanje(id: string) {
      const movement = this.movements.find((m) => m.id === id)
      if (!movement) return

      const newValue = !movement.is_canje
      const { error } = await supabase
        .from('movements')
        .update({ is_canje: newValue })
        .eq('id', id)

      if (error) {
        console.error('Error toggling canje:', error.message)
      } else {
        movement.is_canje = newValue
      }
    },

    async confirmProyectado(id: string) {
      const { error } = await supabase
        .from('movements')
        .update({ is_confirmed: true })
        .eq('id', id)

      if (error) {
        console.error('Error confirming proyectado:', error.message)
      } else {
        const movement = this.movements.find((m) => m.id === id)
        if (movement) movement.is_confirmed = true
      }
    },
  },
})
