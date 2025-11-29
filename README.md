# Panel de Divisas y Riesgo País 🇦🇷💸

Aplicación web en **HTML, CSS y JavaScript** que muestra:

- Conversor de divisas en tiempo (casi) real
- Cotizaciones principales vs **Peso Argentino (ARS)**
- Distintos tipos de dólar en Argentina (oficial, blue, MEP, CCL, tarjeta, mayorista, cripto)
- Riesgo país de Argentina
- Actualización automática cada **5 minutos**

---

## 🧩 Características principales

### 🔁 Conversor de divisas

- Conversión entre múltiples monedas:
  - ARS, USD, EUR, GBP, BRL, PYG, UYU, CLP, MXN, COP, PEN, BOB, CAD, AUD, JPY, CHF, CNY, etc.
- Utiliza una API de tasas globales con base USD.
- Manejo de errores básico (monto inválido, misma moneda, problemas de red).
- Botón para **invertir** las monedas (swap).

---

### 📈 Cotizaciones vs ARS

- Módulo de “cotizaciones principales vs ARS” que muestra:
  - USD, EUR, GBP, BRL, PYG, UYU, CLP, JPY, CNY.
- Cada valor indica cuántos **Pesos Argentinos** equivale **1 unidad** de la moneda extranjera.
- Vista rápida en forma de **chips** (tira de tarjetas) en la parte superior.

---

### 💵 Tipos de dólar en Argentina

Se muestra una tabla con:

- Dólar Oficial  
- Dólar Blue  
- Dólar MEP (Bolsa)  
- Dólar CCL (Contado con Liqui)  
- Dólar Mayorista  
- Dólar Tarjeta  
- Dólar Cripto  

Cada uno con valores de:

- **Compra**
- **Venta**

Los datos se actualizan automáticamente cada **5 minutos**.

---

### 📉 Riesgo País de Argentina

- Muestra el valor actual del **riesgo país (EMBI)**.
- Indica:
  - Valor en puntos básicos.
  - Fecha de la última actualización.
  - Un badge descriptivo:
    - Riesgo relativamente bajo
    - Riesgo moderado
    - Riesgo elevado  

También se actualiza cada **5 minutos**.

---

## 🌐 APIs utilizadas

Este proyecto consume datos de varias APIs públicas:

1. **Tasas de cambio globales**  
   - Base USD, con múltiples monedas.
   - Usado para:
     - Conversor de divisas
     - Cotizaciones principales vs ARS

2. **Tipos de dólar en Argentina**  
   - Devuelve un listado con:
     - oficial, blue, bolsa (MEP), contadoconliqui (CCL), mayorista, tarjeta, cripto.
   - Usado para la tabla de **“Tipos de dólar en Argentina”**.

3. **Riesgo País Argentina**  
   - Devuelve:
     - valor numérico del riesgo país
     - fecha de actualización
   - Usado para la card de “Riesgo País”.

> ⚠️ Las APIs pueden cambiar, presentar límites o estar caídas.  
> El proyecto incluye manejo básico de errores para mostrar mensajes amigables cuando algo falla.

---

## 🛠️ Tecnologías usadas

- **HTML5**
- **CSS3** (layout responsive, diseño tipo dashboard oscuro)
- **JavaScript** (Vanilla JS)
  - `fetch` para consumo de APIs
  - `setInterval` para actualización automática
  - Manipulación del DOM

No requiere frameworks ni bundlers. Es un proyecto ideal para mostrar:

- Consumo de APIs REST
- Trabajo con datos en tiempo real
- Lógica de negocio en JS
- Maquetado web moderno

---

## 📂 Estructura del proyecto

```bash
.
├── index.html      # Estructura principal de la app
├── styles.css      # Estilos del dashboard
└── app.js          # Lógica de negocio y consumo de APIs
