import CSS_TEXT from "$/v-scroll.js";

const TAG = "v-scroll", TRACK_PAD = 3, MIN_THUMB = 16, HIDE_DELAY = 800, WATCH_DELAY = 1000, STYLE_ID = "v-scroll-theme-style";
const SVG_SCROLL = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M12 2L6 8h4v8H6l6 6 6-6h-4V8h4z" fill="#fff" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>`;
const SVG_GRAB = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" fill="none"><path fill="rgba(255,255,255,0.7)" fill-rule="evenodd" d="M3.573 2.036c.48-.178 1.427-.069 1.677.473.213.462.396 1.241.406 1.075.024-.369-.024-1.167.137-1.584.117-.304.347-.59.686-.69a1.9 1.9 0 0 1 .916-.056c.313.064.642.287.765.5.362.622.368 1.898.385 1.83.064-.272.07-1.229.283-1.584.141-.235.497-.445.687-.479.294-.052.656-.068.964-.008.25.05.586.344.677.487.22.344.342 1.316.38 1.658.015.141.073-.393.292-.736.406-.639 1.844-.763 1.898.64.026.653.02.623.02 1.063 0 .516-.012.828-.04 1.202-.03.4-.116 1.304-.24 1.742-.087.301-.372.978-.654 1.384 0 0-1.074 1.25-1.19 1.812-.118.563-.079.567-.103.965-.023.4.121.923.121.923s-.8.104-1.234.034c-.39-.062-.875-.84-1-1.078-.172-.328-.539-.265-.682-.023-.224.383-.709 1.07-1.05 1.113-.669.084-2.055.03-3.14.02 0 0 .185-1.01-.227-1.358-.305-.26-.83-.784-1.144-1.06l-.832-.92c-.283-.36-1.002-.93-1.243-1.986C.875 6.46.896 6 1.125 5.625c.232-.38.67-.589.854-.625.208-.042.692-.039.875.062.223.123.313.16.488.391.23.307.312.456.213.121-.076-.262-.322-.595-.434-.97-.109-.36-.4-.943-.38-1.526.008-.22.103-.77.832-1.042" clip-rule="evenodd"/><path stroke="rgba(0,0,0,0.55)" stroke-linejoin="round" stroke-width=".75" d="M3.573 2.036c.48-.178 1.427-.069 1.677.473.213.462.396 1.241.406 1.075.024-.369-.024-1.167.137-1.584.117-.304.347-.59.686-.69a1.9 1.9 0 0 1 .916-.056c.313.064.642.287.765.5.362.622.368 1.898.385 1.83.064-.272.07-1.229.283-1.584.141-.235.497-.445.687-.479.294-.052.656-.068.964-.008.25.05.586.344.677.487.22.344.342 1.316.38 1.658.015.141.073-.393.292-.736.406-.639 1.844-.763 1.898.64.026.653.02.623.02 1.063 0 .516-.012.828-.04 1.202-.03.4-.116 1.304-.24 1.742-.087.301-.372.978-.654 1.384 0 0-1.074 1.25-1.19 1.812-.118.563-.079.567-.103.965-.023.4.121.923.121.923s-.8.104-1.234.034c-.39-.062-.875-.84-1-1.078-.172-.328-.539-.265-.682-.023-.224.383-.709 1.07-1.05 1.113-.669.084-2.055.03-3.14.02 0 0 .185-1.01-.227-1.358-.305-.26-.83-.784-1.144-1.06l-.832-.92c-.283-.36-1.002-.93-1.243-1.986C.875 6.46.896 6 1.125 5.625c.232-.38.67-.589.854-.625.208-.042.692-.039.875.062.223.123.313.16.488.391.23.307.312.456.213.121-.076-.262-.322-.595-.434-.97-.109-.36-.4-.943-.38-1.526.008-.22.103-.77.832-1.042Z" clip-rule="evenodd"/><path stroke="rgba(0,0,0,0.55)" stroke-linecap="round" stroke-width=".75" d="M10.566 9.734V6.275M8.55 9.746l-.015-3.473m-1.98.032.02 3.426"/></svg>`;

const clamp = (val, lo, hi) => Math.min(hi, Math.max(lo, val));

const toCursor = (svg, hx, hy, fallback) => `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hx} ${hy}, ${fallback}`;

const buildSheet = () => {
  if (!("CSSStyleSheet" in globalThis) || !("replaceSync" in CSSStyleSheet.prototype)) {
    return null;
  }
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(CSS_TEXT);
  return sheet;
};

const SHARED_SHEET = buildSheet();

const ensureGlobalStyle = () => {
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `:root{--svgScroll:${toCursor(SVG_SCROLL, 10, 10, "ns-resize")};--svgGrab:${toCursor(SVG_GRAB, 8, 7, "grabbing")}}body.drag{user-select:none!important;cursor:var(--svgGrab)!important}`;
  document.head.append(style);
};

const buildDom = (root) => {
  const viewport = document.createElement("b"), inner = document.createElement("b"), slot = document.createElement("slot"), bar = document.createElement("b"), thumb = document.createElement("b");
  viewport.className = "scroll";
  viewport.part = "scroll";
  inner.className = "inner";
  inner.style.display = "block";
  bar.className = "bar";
  thumb.className = "thumb";
  thumb.part = "thumb";
  inner.append(slot);
  viewport.append(inner);
  bar.append(thumb);
  if (SHARED_SHEET) {
    root.adoptedStyleSheets = [SHARED_SHEET];
  } else {
    const style = document.createElement("style");
    style.textContent = CSS_TEXT;
    root.append(style);
  }
  root.append(viewport, bar);
  return { viewport, inner, slot, bar, thumb };
};

const scrollRange = (viewport) => Math.max(0, viewport.scrollHeight - viewport.clientHeight);

const trackSpan = (bar, thumb_height) => Math.max(0, bar.clientHeight - TRACK_PAD * 2 - thumb_height);

const scrollToTop = (viewport, bar, thumb_height) => {
  const range = scrollRange(viewport), span = trackSpan(bar, thumb_height), progress = range === 0 ? 0 : viewport.scrollTop / range;
  return TRACK_PAD + progress * span;
};

const topToScroll = (viewport, bar, thumb_height, top) => {
  const range = scrollRange(viewport), span = trackSpan(bar, thumb_height), clamped = clamp(top, TRACK_PAD, TRACK_PAD + span);
  return span === 0 ? 0 : (clamped - TRACK_PAD) / span * range;
};

const barPart = (has_overflow, is_dragging) => {
  const tokens = ["bar"];
  has_overflow && tokens.push("turned");
  is_dragging && tokens.push("drag");
  return tokens.join(" ");
};

const syncBarState = (st) => {
  st.bar && (st.bar.part = barPart(st.host.dataset.overflow === "1", st.host.dataset.dragging === "1"));
};

const showBar = (st) => {
  clearTimeout(st.hide_timer);
  st.host.dataset.overflow === "1" && (st.bar.style.opacity = "1");
};

const scheduleHide = (st) => {
  clearTimeout(st.hide_timer);
  st.hide_timer = setTimeout(() => {
    st.bar && st.host.dataset.dragging !== "1" && !st.hover && (st.bar.style.opacity = "0");
  }, HIDE_DELAY);
};

const flashBar = (st) => {
  showBar(st);
  scheduleHide(st);
};

const updateThumb = (st) => {
  if (!st.viewport) {
    return;
  }
  const overflow = scrollRange(st.viewport) > 0;
  st.host.dataset.overflow = overflow ? "1" : "0";
  if (!overflow) {
    st.thumb.style.transform = `translateY(${TRACK_PAD}px)`;
    st.bar.style.opacity = "0";
    syncBarState(st);
    return;
  }
  const ratio = st.viewport.clientHeight / st.viewport.scrollHeight, room = Math.max(0, st.bar.clientHeight - TRACK_PAD * 2);
  st.thumb_height = clamp(Math.round(room * ratio), MIN_THUMB, room || MIN_THUMB);
  st.thumb.style.blockSize = `${st.thumb_height}px`;
  st.thumb.style.transform = `translateY(${scrollToTop(st.viewport, st.bar, st.thumb_height)}px)`;
  syncBarState(st);
};

const endDrag = (st) => {
  st.drag = null;
  st.host.dataset.dragging = "0";
  document.body.classList.remove("drag");
  syncBarState(st);
  scheduleHide(st);
};

const onPointerDown = (st, event) => {
  if (event.button !== 0 || st.host.dataset.overflow !== "1") {
    return;
  }
  event.preventDefault();
  st.bar.setPointerCapture(event.pointerId);
  const rect = st.bar.getBoundingClientRect(), on_thumb = event.target === st.thumb || st.thumb.contains(event.target), jump_top = clamp(event.clientY - rect.top - st.thumb_height / 2, TRACK_PAD, TRACK_PAD + trackSpan(st.bar, st.thumb_height));
  if (!on_thumb) {
    st.viewport.scrollTop = topToScroll(st.viewport, st.bar, st.thumb_height, jump_top);
  }
  st.drag = { pointer_id: event.pointerId, start_y: event.clientY, start_top: on_thumb ? scrollToTop(st.viewport, st.bar, st.thumb_height) : jump_top };
  st.host.dataset.dragging = "1";
  document.body.classList.add("drag");
  syncBarState(st);
  showBar(st);
};

const onPointerMove = (st, event) => {
  if (!st.drag || event.pointerId !== st.drag.pointer_id) {
    return;
  }
  st.viewport.scrollTop = topToScroll(st.viewport, st.bar, st.thumb_height, st.drag.start_top + (event.clientY - st.drag.start_y));
};

const onPointerEnd = (st, event) => {
  if (!st.drag || event.pointerId !== st.drag.pointer_id) {
    return;
  }
  st.bar.hasPointerCapture(event.pointerId) && st.bar.releasePointerCapture(event.pointerId);
  endDrag(st);
};

const connect = (host) => {
  if (host.vs) {
    return;
  }
  ensureGlobalStyle();
  host.dataset.dragging = "0";
  const refs = buildDom(host.shadowRoot), st = { host, ...refs, drag: null, thumb_height: MIN_THUMB, hide_timer: 0, watch_timer: 0, hover: false };
  host.vs = st;

  const onScroll = () => {
    updateThumb(st);
    flashBar(st);
  };
  const onEnter = () => {
    st.hover = true;
    showBar(st);
  };
  const onLeave = () => {
    st.hover = false;
    scheduleHide(st);
  };
  const onResize = () => updateThumb(st);
  const onDown = (event) => onPointerDown(st, event);
  const onMove = (event) => onPointerMove(st, event);
  const onEnd = (event) => onPointerEnd(st, event);

  st.viewport.addEventListener("scroll", onScroll, { passive: true });
  st.slot.addEventListener("slotchange", onResize);
  st.bar.addEventListener("pointerdown", onDown);
  st.bar.addEventListener("pointermove", onMove);
  st.bar.addEventListener("pointerup", onEnd);
  st.bar.addEventListener("pointercancel", onEnd);
  st.bar.addEventListener("pointerenter", onEnter);
  st.bar.addEventListener("pointerleave", onLeave);

  const observer = new ResizeObserver(onResize);
  observer.observe(host);
  observer.observe(st.viewport);
  observer.observe(st.inner);

  st.cleanup = () => {
    observer.disconnect();
    st.viewport.removeEventListener("scroll", onScroll);
    st.slot.removeEventListener("slotchange", onResize);
    st.bar.removeEventListener("pointerdown", onDown);
    st.bar.removeEventListener("pointermove", onMove);
    st.bar.removeEventListener("pointerup", onEnd);
    st.bar.removeEventListener("pointercancel", onEnd);
    st.bar.removeEventListener("pointerenter", onEnter);
    st.bar.removeEventListener("pointerleave", onLeave);
  };

  st.watch_timer = setInterval(() => document.contains(host) || disconnect(host), WATCH_DELAY);
  updateThumb(st);
  flashBar(st);
};

const disconnect = (host) => {
  const st = host.vs;
  if (!st) {
    return;
  }
  endDrag(st);
  clearTimeout(st.hide_timer);
  clearInterval(st.watch_timer);
  st.cleanup();
  host.shadowRoot.replaceChildren();
  host.vs = null;
};

class VScroll extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    connect(this);
  }

  disconnectedCallback() {
    disconnect(this);
  }
}

customElements.get(TAG) || customElements.define(TAG, VScroll);
