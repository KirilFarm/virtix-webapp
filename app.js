const tg = window.Telegram.WebApp;
tg.expand();

const state = {
  lang: "ru",
  discount: 10,
  manager: "Dighon",

  // Категории и товары
  categories: [
    {
      id: "rp",
      title_ru: "РП Проекты",
      title_ua: "РП Проєкти",
      subs: [
        {
          id: "black_russia",
          title_ru: "Black Russia",
          title_ua: "Black Russia",
          items: [
            { id: "br_1", title_ru: "Вирты BR • 1 000 000", title_ua: "Вірти BR • 1 000 000", price: 199 },
            { id: "br_2", title_ru: "Вирты BR • 5 000 000", title_ua: "Вірти BR • 5 000 000", price: 899 },
            { id: "br_3", title_ru: "Вирты BR • 10 000 000", title_ua: "Вірти BR • 10 000 000", price: 1699 },
          ]
        },
        {
          id: "arizona",
          title_ru: "Arizona",
          title_ua: "Arizona",
          items: [
            { id: "az_1", title_ru: "Вирты AZ • 1 000 000", title_ua: "Вірти AZ • 1 000 000", price: 249 },
            { id: "az_2", title_ru: "Вирты AZ • 5 000 000", title_ua: "Вірти AZ • 5 000 000", price: 1099 },
            { id: "az_3", title_ru: "Вирты AZ • 10 000 000", title_ua: "Вірти AZ • 10 000 000", price: 1999 },
          ]
        }
      ]
    }
  ],

  activeCat: "rp",
  activeSub: "black_russia",
};

const $grid = document.getElementById("grid");
const $q = document.getElementById("q");
const $lang = document.getElementById("lang");
const $manager = document.getElementById("manager");
const $orders = document.getElementById("orders");
const $discount = document.getElementById("discount");
const $chips = document.getElementById("chips");
const $subchips = document.getElementById("subchips");
const $heroTitle = document.getElementById("heroTitle");
const $heroSub = document.getElementById("heroSub");
const $clear = document.getElementById("clear");

function TL(obj){ return state.lang === "ru" ? obj.title_ru : obj.title_ua; }

function getActive() {
  const cat = state.categories.find(c => c.id === state.activeCat) || state.categories[0];
  const sub = (cat.subs || []).find(s => s.id === state.activeSub) || cat.subs[0];
  return { cat, sub };
}

function flattenItems() {
  const { cat, sub } = getActive();
  return (sub.items || []).map(x => ({
    ...x,
    cat_id: cat.id,
    cat_title: TL(cat),
    sub_id: sub.id,
    sub_title: TL(sub),
  }));
}

function renderChips() {
  $chips.innerHTML = state.categories.map(c => {
    const active = c.id === state.activeCat ? "active" : "";
    return `<button class="chip ${active}" data-cat="${c.id}">${TL(c)}</button>`;
  }).join("");

  const cat = state.categories.find(c => c.id === state.activeCat) || state.categories[0];
  $subchips.innerHTML = (cat.subs || []).map(s => {
    const active = s.id === state.activeSub ? "active" : "";
    return `<button class="chip ${active}" data-sub="${s.id}">${TL(s)}</button>`;
  }).join("");
}

function renderHero() {
  const { cat, sub } = getActive();
  $heroTitle.textContent = TL(cat);
  $heroSub.textContent = state.lang === "ru"
    ? `Сервер: ${TL(sub)} • Выбирай пакет виртов ниже`
    : `Сервер: ${TL(sub)} • Обирай пакет віртів нижче`;

  $discount.textContent = state.lang === "ru"
    ? `🎁 Скидка - ${state.discount}%`
    : `🎁 Знижка - ${state.discount}%`;

  $q.placeholder = state.lang === "ru" ? "Я ищу..." : "Я шукаю...";
  $manager.textContent = state.lang === "ru" ? "✉️ Написать менеджеру" : "✉️ Написати менеджеру";
  $orders.textContent = state.lang === "ru" ? "🧾 Мои заказы" : "🧾 Мої замовлення";
  $lang.textContent = state.lang.toUpperCase();
}

function priceWithDiscount(base) {
  return Math.max(0, Math.round(base * (100 - state.discount) / 100));
}

function renderGrid() {
  const q = ($q.value || "").toLowerCase().trim();
  const items = flattenItems().filter(p => TL(p).toLowerCase().includes(q) || p.sub_title.toLowerCase().includes(q));

  $grid.innerHTML = items.map(p => {
    const newPrice = priceWithDiscount(p.price);
    const pill = state.lang === "ru" ? "🎄 New Year" : "🎄 New Year";
    const buy = state.lang === "ru" ? "Купить" : "Купити";

    return `
      <div class="item">
        <div class="itemTop">
          <div class="itemTitle">${TL(p)}</div>
          <div class="pill">${pill}</div>
        </div>
        <div class="itemMeta">${p.cat_title} • ${p.sub_title}</div>
        <div class="priceRow">
          <div class="priceNow">${newPrice} грн</div>
          ${newPrice !== p.price ? `<div class="priceOld">${p.price} грн</div>` : ``}
        </div>
        <button class="buy" data-id="${p.id}">${buy}</button>
      </div>
    `;
  }).join("");

  if (!items.length) {
    $grid.innerHTML = `
      <div class="item" style="grid-column:1/-1;">
        <div class="itemTitle">${state.lang==="ru" ? "Ничего не найдено" : "Нічого не знайдено"}</div>
        <div class="itemMeta">${state.lang==="ru" ? "Попробуй другой запрос." : "Спробуй інший запит."}</div>
      </div>
    `;
  }
}

function renderAll() {
  renderChips();
  renderHero();
  renderGrid();
}

$chips.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-cat]");
  if (!btn) return;
  state.activeCat = btn.dataset.cat;

  const cat = state.categories.find(c => c.id === state.activeCat);
  state.activeSub = (cat?.subs?.[0]?.id) || state.activeSub;

  $q.value = "";
  renderAll();
});

$subchips.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-sub]");
  if (!btn) return;
  state.activeSub = btn.dataset.sub;
  $q.value = "";
  renderAll();
});

$q.addEventListener("input", renderGrid);

$clear.addEventListener("click", () => {
  $q.value = "";
  renderGrid();
});

$lang.addEventListener("click", () => {
  state.lang = state.lang === "ru" ? "ua" : "ru";
  renderAll();
});

$manager.addEventListener("click", () => tg.openTelegramLink("https://t.me/" + state.manager));

$orders.addEventListener("click", () => {
  tg.showAlert(state.lang==="ru" ? "Заказы отображаются в чате бота." : "Замовлення відображаються в чаті бота.");
});

$grid.addEventListener("click", (e) => {
  const btn = e.target.closest("button.buy[data-id]");
  if (!btn) return;

  const id = btn.dataset.id;
  const item = flattenItems().find(x => x.id === id);
  if (!item) return;

  const base = item.price;
  const finalPrice = priceWithDiscount(base);

  const payload = {
    kind: "order",
    category: item.cat_id,
    subcategory: item.sub_id,
    title: TL(item),
    base_price_uah: base,
    price_uah: finalPrice,
    discount_pct: state.discount,
    lang: state.lang,
    manager: state.manager,
    user_id: tg.initDataUnsafe?.user?.id || null
  };

  tg.sendData(JSON.stringify(payload));
  tg.close();
});

renderAll();
