export type MovementType = 'cuota_fija' | 'gasto_variable' | 'abono_real' | 'abono_proyectado'

export interface Movement {
  id: string
  type: MovementType
  description: string
  amount: number
  date: string
  category?: string
  is_canje: boolean
  is_confirmed: boolean
  cuota_current?: number
  cuota_total?: number
  month: string
  created_at?: string
}

export type NewMovement = Omit<Movement, 'id' | 'created_at'>
