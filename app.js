console.log("app.js cargado ✅");

// ==============================
// Configuración de APIs
// ==============================

// API de tasas globales (base USD)
const FX_API_URL = "https://open.er-api.com/v6/latest/USD";

// API de distintos tipos de dólar en Argentina
const DOLAR_API_URL = "https://dolarapi.com/v1/dolares";

// API de riesgo país
const RIESGO_API_URL =
  "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo";

// Monedas importantes para el conversor
const IMPORTANT_CURRENCIES = [
  { code: "ARS", name: "Peso Argentino" },
  { code: "USD", name: "Dólar estadounidense" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "Libra esterlina" },
  { code: "PYG", name: "Guaraní paraguayo" },
  { code: "BRL", name: "Real brasileño" },
  { code: "UYU", name: "Peso uruguayo" },
  { code: "CLP", name: "Peso chileno" },
  { code: "MXN", name: "Peso mexicano" },
  { code: "COP", name: "Peso colombiano" },
  { code: "PEN", name: "Sol peruano" },
  { code: "BOB", name: "Boliviano" },
  { code: "CAD", name: "Dólar canadiense" },
  { code: "AUD", name: "Dólar australiano" },
  { code: "JPY", name: "Yen japonés" },
  { code: "CHF", name: "Franco suizo" },
  { code: "CNY", name: "Yuan chino" }
];

// Monedas para mostrar vs ARS (carrusel + tabla)
const FX_SYMBOLS_FOR_ARS = [
  "USD",
  "EUR",
  "GBP",
  "BRL",
  "PYG",
  "UYU",
  "CLP",
  "JPY",
  "CNY"
];

// Tipos de dólar (DolarApi)
const DOLLAR_CASAS_ORDER = [
  "oficial",
  "blue",
  "bolsa",          // MEP
  "contadoconliqui",// CCL
  "mayorista",
  "tarjeta",
  "cripto"
];

const DOLLAR_CASAS_LABELS = {
  oficial: "Oficial",
  blue: "Blue",
  bolsa: "MEP",
  contadoconliqui: "CCL",
  mayorista: "Mayorista",
  tarjeta: "Tarjeta",
  cripto: "Cripto"
};

// ==============================
// DOM
// ==============================

// Conversor
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from-currency");
const toSelect = document.getElementById("to-currency");
const form = document.getElementById("converter-form");
const resultBox = document.getElementById("result");
const resultValue = document.getElementById("result-value");
const swapBtn = document.getElementById("swap-btn");

// Cotizaciones vs ARS
const mainQuotesBody = document.getElementById("main-quotes-body");
const carouselEl = document.getElementById("rates-carousel");

// Tipos de dólar
const dollarTypesBody = document.getElementById("dollar-types-body");

// Riesgo país
const riesgoCard = document.getElementById("riesgo-card");
const riesgoValor = document.getElementById("riesgo-valor");
const riesgoFecha = document.getElementById("riesgo-fecha");
const riesgoBadge = document.getElementById("riesgo-badge");

// Últimas actualizaciones
const fxLastUpdateEl = document.getElementById("fx-last-update");
const dollarLastUpdateEl = document.getElementById("dollar-last-update");
const riesgoLastUpdateEl = document.getElementById("riesgo-last-update");

// Tema
const themeToggleBtn = document.getElementById("theme-toggle");

// ==============================
// Estado de tasas (cache en memoria)
// ==============================

let latestRates = null;      // { "ARS": valor, "EUR": valor, ... } base USD
let lastRatesUpdate = null;  // Date

// Auto-scroll carrusel
let carouselAutoScrollFrame = null;

// ==============================
// Helpers de tiempo y formato
// ==============================

function formatLocalTime(date) {
  if (!date) return "—";
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function setLastUpdate(element, date = new Date()) {
  if (!element) return;
  element.textContent = formatLocalTime(date);
}

// ==============================
// Tema oscuro / claro
// ==============================

function applyTheme(theme) {
  const body = document.body;
  if (theme === "light") {
    body.classList.add("theme-light");
    if (themeToggleBtn) {
      themeToggleBtn.textContent = "🌙 Modo oscuro";
    }
  } else {
    body.classList.remove("theme-light");
    if (themeToggleBtn) {
      themeToggleBtn.textContent = "☀️ Modo claro";
    }
  }
  localStorage.setItem("theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  const initialTheme = saved === "light" ? "light" : "dark";
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isLight = document.body.classList.contains("theme-light");
      const next = isLight ? "dark" : "light";
      applyTheme(next);
    });
  }
}

// ==============================
// Tasas FX: fetch + cache
// ==============================

async function fetchLatestRates() {
  console.log("🔄 Pidiendo tasas a open.er-api.com...");
  const res = await fetch(FX_API_URL);
  if (!res.ok) {
    throw new Error("Error HTTP al obtener tasas de cambio");
  }

  const data = await res.json();
  console.log("Respuesta de FX API:", data);

  if (data.result !== "success" || !data.rates) {
    throw new Error("Respuesta inválida de la API de tasas");
  }

  latestRates = data.rates;
  lastRatesUpdate = new Date();
}

/**
 * Asegura que tengamos tasas frescas.
 * - Si nunca se pidieron -> pide.
 * - Si tienen más de ~4 minutos -> pide de nuevo.
 * - Si están “frescas” -> usa las cacheadas.
 */
async function ensureRates(force = false) {
  const MAX_AGE_MS = 4 * 60 * 1000; // 4 minutos aprox
  const now = Date.now();

  const isStale =
    !lastRatesUpdate ||
    now - lastRatesUpdate.getTime() > MAX_AGE_MS;

  if (force || !latestRates || isStale) {
    await fetchLatestRates();
  }
}

// ==============================
// 1) Cargar monedas del conversor
// ==============================

function loadCurrenciesForConverter() {
  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";

  IMPORTANT_CURRENCIES.forEach(({ code, name }) => {
    const text = `${code} - ${name}`;
    const optFrom = document.createElement("option");
    const optTo = document.createElement("option");
    optFrom.value = code;
    optTo.value = code;
    optFrom.textContent = text;
    optTo.textContent = text;
    fromSelect.appendChild(optFrom);
    toSelect.appendChild(optTo);
  });

  const fromDefault = IMPORTANT_CURRENCIES.find((c) => c.code === "ARS")
    ? "ARS"
    : IMPORTANT_CURRENCIES[0].code;
  const toDefault = IMPORTANT_CURRENCIES.find((c) => c.code === "USD")
    ? "USD"
    : IMPORTANT_CURRENCIES[1]?.code ?? IMPORTANT_CURRENCIES[0].code;

  fromSelect.value = fromDefault;
  toSelect.value = toDefault;
}

// ==============================
// 2) Conversor usando las tasas (base USD)
// ==============================

async function convertCurrencyAPI(amount, from, to) {
  // Aseguramos tasas frescas
  await ensureRates();

  if (from === to) return amount;

  const rates = latestRates;

  if (!rates[from]) throw new Error(`Moneda no soportada: ${from}`);
  if (!rates[to]) throw new Error(`Moneda no soportada: ${to}`);

  let result;

  if (from === "USD") {
    // 1 USD = rates[to] (to)
    result = amount * rates[to];
  } else if (to === "USD") {
    // 1 USD = rates[from] (from) ⇒ 1 from = 1 / rates[from] USD
    result = amount / rates[from];
  } else {
    const amountInUSD = amount / rates[from];
    result = amountInUSD * rates[to];
  }

  return Number(result.toFixed(4));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  resultBox.classList.remove("error");

  const rawAmount = amountInput.value.trim();
  const amount = parseFloat(rawAmount);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (isNaN(amount) || amount <= 0) {
    resultValue.textContent = "Ingresa un monto válido mayor que 0.";
    resultBox.classList.add("error");
    return;
  }

  if (from === to) {
    resultValue.textContent = "Las monedas son iguales.";
    resultBox.classList.add("error");
    return;
  }

  resultValue.textContent = "Convirtiendo...";

  try {
    const converted = await convertCurrencyAPI(amount, from, to);
    resultValue.textContent = `${amount} ${from} = ${converted} ${to}`;
  } catch (error) {
    console.error(error);
    resultValue.textContent =
      "Error en la conversión. Verifica la conexión o intenta más tarde.";
    resultBox.classList.add("error");
  }
});

swapBtn.addEventListener("click", () => {
  const from = fromSelect.value;
  const to = toSelect.value;
  fromSelect.value = to;
  toSelect.value = from;

  if (amountInput.value.trim() !== "") {
    form.dispatchEvent(new Event("submit"));
  }
});

// ==============================
// 3) FX vs ARS (tabla + carrusel)
// ==============================

function renderMainQuotesTable(fxData) {
  const order = [
    { code: "USD", label: "Dólar estadounidense" },
    { code: "EUR", label: "Euro" },
    { code: "GBP", label: "Libra esterlina" },
    { code: "BRL", label: "Real brasileño" },
    { code: "PYG", label: "Guaraní paraguayo" },
    { code: "UYU", label: "Peso uruguayo" },
    { code: "CLP", label: "Peso chileno" },
    { code: "JPY", label: "Yen japonés" },
    { code: "CNY", label: "Yuan chino" }
  ];

  let html = "";
  order.forEach((row) => {
    const value = fxData[row.code];
    if (!value) return;

    html += `
      <tr>
        <td>${row.code}</td>
        <td>${row.label}</td>
        <td>${value.toFixed(2)} ARS</td>
      </tr>
    `;
  });

  if (!html) {
    html = `<tr><td colspan="3">No se pudieron cargar las cotizaciones.</td></tr>`;
  }

  mainQuotesBody.innerHTML = html;
}

// Carrusel como tira de chips
function renderCarouselAll(fxData) {
  const labels = {
    USD: "Dólar vs Peso Argentino",
    EUR: "Euro vs Peso Argentino",
    GBP: "Libra vs Peso Argentino",
    BRL: "Real vs Peso Argentino",
    PYG: "Guaraní vs Peso Argentino",
    UYU: "Peso uruguayo vs ARS",
    CLP: "Peso chileno vs ARS",
    JPY: "Yen vs ARS",
    CNY: "Yuan vs ARS"
  };

  const codes = FX_SYMBOLS_FOR_ARS.filter((code) => fxData[code]);

  if (!codes.length) {
    carouselEl.innerHTML =
      "<p>No se pudieron obtener datos para las cotizaciones.</p>";
    return;
  }

  let html = "";
  codes.forEach((code) => {
    const value = fxData[code];
    const valueText = `${value.toFixed(2)} ARS`;

    html += `
      <div class="rate-chip">
        <div class="rate-chip-header">
          <span class="rate-chip-code">${code}</span>
        </div>
        <div class="rate-chip-label">
          ${labels[code] || "Cotización vs peso argentino"}
        </div>
        <div class="rate-chip-value">
          ${valueText}
        </div>
      </div>
    `;
  });

  carouselEl.innerHTML = html;

  // activar auto-scroll continuo en mobile
  setupCarouselAutoScroll();
}

// ==============================
// Auto-scroll continuo del carrusel (en todas las pantallas)
// ==============================
function setupCarouselAutoScroll() {
  if (!carouselEl) return;

  // Cancelamos cualquier animación anterior
  if (carouselAutoScrollFrame) {
    cancelAnimationFrame(carouselAutoScrollFrame);
    carouselAutoScrollFrame = null;
  }

  const speedPxPerSec = 40; // velocidad: px por segundo (ajustable)
  let lastTimestamp = null;

  function step(timestamp) {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
      carouselAutoScrollFrame = requestAnimationFrame(step);
      return;
    }

    const delta = timestamp - lastTimestamp; // ms desde el frame anterior
    lastTimestamp = timestamp;

    const maxScroll = carouselEl.scrollWidth - carouselEl.clientWidth;
    if (maxScroll <= 0) {
      // No hay overflow, nada que mover
      return;
    }

    const distance = (speedPxPerSec * delta) / 1000; // px a avanzar
    let next = carouselEl.scrollLeft + distance;

    if (next >= maxScroll) {
      // Cuando llega al final, vuelve al inicio
      next = 0;
    }

    carouselEl.scrollLeft = next;
    carouselAutoScrollFrame = requestAnimationFrame(step);
  }

  // Arrancamos la animación
  carouselAutoScrollFrame = requestAnimationFrame(step);
}

async function loadFxAgainstARS() {
  try {
    await ensureRates();
    const rates = latestRates;

    const usdToARS = rates["ARS"];
    if (!usdToARS) {
      throw new Error("La API no devolvió tasa para ARS");
    }

    const fxData = {};
    FX_SYMBOLS_FOR_ARS.forEach((code) => {
      const r = rates[code];
      if (!r) return;
      // 1 code = (usdToARS / r) ARS
      fxData[code] = usdToARS / r;
    });

    renderMainQuotesTable(fxData);
    renderCarouselAll(fxData);

    setLastUpdate(fxLastUpdateEl, lastRatesUpdate || new Date());
  } catch (error) {
    console.error(error);
    if (carouselEl) {
      carouselEl.innerHTML =
        "<p>Error al cargar el carrusel de cotizaciones.</p>";
    }
    if (mainQuotesBody) {
      mainQuotesBody.innerHTML =
        "<tr><td colspan='3'>Error al cargar las cotizaciones.</td></tr>";
    }
  }
}

// ==============================
// 4) Tipos de dólar en Argentina
// ==============================

async function loadDollarTypes() {
  if (!dollarTypesBody) return;

  try {
    dollarTypesBody.innerHTML = `
      <tr>
        <td colspan="3">Cargando tipos de dólar...</td>
      </tr>
    `;

    const res = await fetch(DOLAR_API_URL);
    if (!res.ok) {
      throw new Error("Error HTTP en DolarApi");
    }

    const data = await res.json();
    console.log("DolarApi /v1/dolares:", data);

    if (!Array.isArray(data)) {
      throw new Error("Respuesta inválida de DolarApi");
    }

    let html = "";

    DOLLAR_CASAS_ORDER.forEach((casaKey) => {
      const item = data.find((d) => d.casa === casaKey);
      if (!item) return;

      const compra = Number(item.compra);
      const venta = Number(item.venta);

      const compraFmt = isNaN(compra)
        ? "-"
        : compra.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

      const ventaFmt = isNaN(venta)
        ? "-"
        : venta.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

      html += `
        <tr>
          <td>Dólar ${DOLLAR_CASAS_LABELS[casaKey] ?? casaKey}</td>
          <td>$ ${compraFmt}</td>
          <td>$ ${ventaFmt}</td>
        </tr>
      `;
    });

    if (!html) {
      html = `
        <tr>
          <td colspan="3">No se pudieron cargar las cotizaciones de los distintos dólares.</td>
        </tr>
      `;
    }

    dollarTypesBody.innerHTML = html;
    setLastUpdate(dollarLastUpdateEl, new Date());
  } catch (error) {
    console.error(error);
    dollarTypesBody.innerHTML = `
      <tr>
        <td colspan="3">Error al cargar las cotizaciones de los distintos dólares.</td>
      </tr>
    `;
  }
}

// ==============================
// 5) Riesgo País Argentina
// ==============================

async function loadRiesgoPais() {
  try {
    const res = await fetch(RIESGO_API_URL);
    if (!res.ok) {
      throw new Error("Error HTTP en riesgo país");
    }

    const data = await res.json();
    console.log("Riesgo país:", data);

    const valor = typeof data.valor === "number"
      ? data.valor
      : Number(data.valor);
    const fecha = data.fecha || "Sin fecha";

    if (Number.isNaN(valor)) {
      throw new Error("Valor de riesgo país inválido");
    }

    riesgoValor.textContent = valor.toFixed(0);
    riesgoFecha.textContent = fecha;

    let levelClass = "riesgo-medium";
    let label = "Riesgo moderado";

    if (valor < 500) {
      levelClass = "riesgo-low";
      label = "Riesgo relativamente bajo";
    } else if (valor > 1500) {
      levelClass = "riesgo-high";
      label = "Riesgo elevado";
    }

    riesgoCard.classList.remove("riesgo-low", "riesgo-medium", "riesgo-high");
    riesgoCard.classList.add(levelClass);
    riesgoBadge.textContent = label;

    setLastUpdate(riesgoLastUpdateEl, new Date());
  } catch (error) {
    console.error(error);
    riesgoValor.textContent = "Error";
    riesgoFecha.textContent = "No disponible";
    riesgoBadge.textContent = "Sin datos";
  }
}

// ==============================
// 6) Inicializar
// ==============================

function init() {
  initTheme();
  loadCurrenciesForConverter();

  // Carga inicial
  loadFxAgainstARS();
  loadRiesgoPais();
  loadDollarTypes();

  // Refrescar cada 5 minutos
  const FIVE_MIN = 5 * 60 * 1000;
  setInterval(() => loadFxAgainstARS(), FIVE_MIN);
  setInterval(() => loadRiesgoPais(), FIVE_MIN);
  setInterval(() => loadDollarTypes(), FIVE_MIN);

  // Recalcular auto-scroll si cambia el tamaño/orientación
  window.addEventListener("resize", setupCarouselAutoScroll);
}

document.addEventListener("DOMContentLoaded", init);
