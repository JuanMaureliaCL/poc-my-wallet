# Spec: App Control Tarjeta de Crédito — TC MARZO

## ¿Qué hace esta app?

Es una herramienta personal para controlar el gasto mensual de una tarjeta de crédito. El objetivo principal es saber en todo momento cuánto dinero disponible real queda para gastar en el mes, considerando lo que ya está en el banco, lo que falta por cobrar, y lo que ya se ha gastado.

---

## Las 4 categorías de movimientos

### 1. Cuotas Fijas
Son compromisos inamovibles que se pagan mes a mes independiente de lo que pase. El usuario no puede decidir no pagarlas. Tienen número de cuota (ej: 2/3 significa segunda de tres cuotas). Siempre restan del disponible.

### 2. Gastos Variables
Son los gastos del día a día que el usuario decide: comida, transporte, supermercado, ocio, etc. Siempre restan del disponible, **excepto los canjes de puntos** (ver abajo).

### 3. Abonos Reales
Es el dinero que el usuario ya tiene físicamente disponible para pagar la tarjeta. Pueden venir de distintas fuentes (ej: cuenta Scotia, efectivo en casa). Siempre suman al disponible.

### 4. Abonos Proyectados
Es dinero que el usuario espera recibir pero que aún no está en su poder (ej: deudas que le deben pagar, reembolsos, cobros pendientes). Suman al disponible pero son inciertos hasta que se confirmen.

---

## Regla especial: Canjes de Puntos

Algunos gastos variables se pagan con puntos acumulados de la tarjeta, no con dinero real. Estos gastos:
- Deben aparecer en la lista para tener registro histórico
- Se muestran visualmente distintos (tachados o marcados)
- Su monto real para el cálculo es $0 — no restan del disponible

---

## Cómo se calcula el Saldo Disponible

```
Total Gastado    = Cuotas Fijas + Gastos Variables (sin contar canjes)
Total Abonos     = Abonos Reales + Abonos Proyectados
Saldo Disponible = Total Abonos - Total Gastado
```

Este número es el corazón de la app. Debe ser siempre visible y actualizarse en tiempo real cada vez que se agrega o modifica un movimiento.

---

## Datos del mes actual (Marzo 2025)

### Abonos Reales
- Scotia: $534.006
- Efectivo: $160.000

### Abonos Proyectados
- Primera Cuota Ema: $1.100.000

### Cuotas Fijas
| Descripción | Cuota | Monto |
|---|---|---|
| Multibike | 34/36 | $54.747 |
| MacOnline | 6/6 | $33.332 |
| Cocha Travel | 2/3 | $75.137 |
| Latam | 2/3 | $446.473 |
| Latam | 2/3 | $447.488 |
| Zapatillas | 1/3 | $53.330 |
| Bubba | 1/6 | $9.916 |

### Gastos Variables
| Fecha | Descripción | Categoría | Monto | Canje |
|---|---|---|---|---|
| 23-feb | Jetsmart | Transporte | $67.428 | No |
| 24-feb | Unimarc | Supermercado | $6.690 | No |
| 25-feb | SecretoAleman | Comida | $32.010 | No |
| 25-feb | CafeLea | Café | $12.210 | No |
| 26-feb | Pplaza | Varios | $15.290 | No |
| 26-feb | NobleCorral | Comida | $16.334 | No |
| 28-feb | Comericalizadora STGO | Varios | $27.280 | No |
| 28-feb | Comercial Yolanda | Varios | $12.880 | No |
| 1-mar | Uber | Transporte | $4.197 | No |
| 2-mar | Uber Lime | Transporte | $1.900 | No |
| 2-mar | Lagardere Airport | Viaje | $12.738 | No |
| 4-mar | UberEats | Comida | $0 | Sí |
| 5-mar | LomoAleman | Comida | $20.240 | No |
| 5-mar | Jumbo | Supermercado | $19.470 | No |
| 7-mar | Don Domingo | Comida | $22.000 | No |
| 7-mar | Varsonvinne Alfajores | Comida | $15.000 | No |
| 8-mar | Parrillada 8M | Comida | $43.230 | No |
| 8-mar | (sin nombre) | Varios | $29.389 | No |
| 9-mar | Unimarc Fajitas | Supermercado | $0 | Sí |
| 10-mar | Secreto Aleman | Comida | $17.160 | No |
| 11-mar | Casa Royale | Varios | $56.917 | No |
| 11-mar | Unimarc | Supermercado | $3.029 | No |
| 11-mar | Unimarc | Supermercado | $27.970 | No |
| 12-mar | Uber Eats | Comida | $20.660 | No |
| 12-mar | Uber | Transporte | $3.340 | No |
| 12-mar | Uber | Transporte | $4.067 | No |
| 13-mar | Combustible | Transporte | $15.000 | No |
| 13-mar | Unimarc | Supermercado | $5.750 | No |
| 14-mar | Don Domingo | Comida | $15.000 | No |

---

## Funcionalidades que debe tener la app

1. **Ver el Saldo Disponible** siempre visible y destacado
2. **Agregar un movimiento** de cualquier tipo (cuota fija, gasto variable, abono real, abono proyectado)
3. **Marcar un abono proyectado como recibido** — cuando llega el dinero pasa a ser abono real
4. **Marcar un gasto como canje de puntos** — queda en la lista pero con monto $0
5. **Eliminar un movimiento** en caso de error
6. **Ver los totales por sección** — total cuotas, total variables, total abonos

---

## Flujo típico del usuario

El usuario abre la app durante el día, ve su saldo disponible actual, agrega el gasto que acaba de hacer con la tarjeta, y verifica que aún tiene margen para el resto del mes. Al recibir un pago pendiente, lo marca como recibido y el saldo sube automáticamente.
