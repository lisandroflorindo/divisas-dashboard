# 🌍 Divisas y Riesgo País (Argentina)

Dashboard web para visualizar cotizaciones de divisas, tipos de dólar en Argentina y riesgo país, con conversor integrado y actualización automática de datos.

Proyecto desarrollado con **HTML, CSS y JavaScript** (sin frameworks) por **Lisandro Florindo**.

---

## 🔗 Demo en vivo

👉 **Demo:** https://lisandroflorindo.github.io/divisas-dashboard/
👉 **Repositorio:** https://github.com/lisandroflorindo/divisas-dashboard.git

---

## ✨ Funcionalidades principales

- ✅ **Conversor de divisas** entre múltiples monedas:
  - ARS, USD, EUR, GBP, BRL, PYG, UYU, CLP, MXN, COP, PEN, BOB, CAD, AUD, JPY, CHF, CNY, entre otras.
  - Conversión utilizando tasas de cambio reales (base USD).

- 📈 **Cotizaciones vs Peso Argentino (ARS)**:
  - Dólar, Euro, Libra, Real, Guaraní, Peso uruguayo, Peso chileno, Yen, Yuan, etc.
  - Tabla de cotizaciones principales.
  - Carrusel animado con las cotizaciones más relevantes.

- 💵 **Tipos de dólar en Argentina** (vía DolarApi):
  - Oficial  
  - Blue  
  - MEP (Bolsa)  
  - CCL (Contado con Liqui)  
  - Mayorista  
  - Tarjeta  
  - Cripto  

- 🇦🇷 **Riesgo País de Argentina**:
  - Valor numérico actualizado.
  - Fecha del último dato.
  - Etiqueta visual indicando si el riesgo es bajo, moderado o alto.

- 🌓 **Modo oscuro / claro**:
  - Toggle de tema.
  - Preferencia guardada en `localStorage`.

- 🔄 **Actualización automática**:
  - Cotizaciones FX, tipos de dólar y riesgo país se actualizan cada **5 minutos**.

- 📱 **Diseño responsive**:
  - Optimizado para **desktop, tablet y móvil**.
  - Carrusel de cotizaciones con efecto continuo que ahorra espacio y mantiene siempre visible la información.

---

## 🧩 Tecnologías utilizadas

- **Frontend:**
  - HTML5
  - CSS3 (diseño moderno, cards, carrusel animado)
  - JavaScript (vanilla, sin frameworks)

- **APIs consumidas:**
  - Tasas de cambio globales (base USD):  
    - `https://open.er-api.com/v6/latest/USD`
  - Tipos de dólar en Argentina:  
    - `https://dolarapi.com/v1/dolares`
  - Riesgo país de Argentina:  
    - `https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo`

---

## 📁 Estructura del proyecto

```bash
.
├── index.html        # Estructura principal de la página
├── styles.css        # Estilos (tema oscuro/claro, layout, carrusel, etc.)
├── app.js            # Lógica del conversor, fetch de APIs y actualización de UI
