import "./page.css";
import "./v-scroll.js";

const fillRows = (el, start, count) => {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const p = document.createElement("p");
    p.className = "row";
    p.textContent = `Welcome to vibe ${start + i}`;
    fragment.append(p);
  }
  el.append(fragment);
};

const mount = () => {
  const demo_a = document.querySelector("#demo-a");
  const demo_c = document.querySelector("#demo-c");
  const append_btn = document.querySelector("#append-btn");
  let next_index = 0;

  fillRows(demo_a, 0, 120);
  fillRows(demo_c, 0, 60);
  next_index = 60;

  append_btn?.addEventListener("click", () => {
    fillRows(demo_c, next_index, 10);
    next_index += 10;
  });
};

mount();
