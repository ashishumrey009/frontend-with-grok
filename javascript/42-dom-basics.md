# Chapter 42: DOM Basics

**Interviewer:** DOM kya hai? Element select / create / update kaise?

**Tum:**

"DOM HTML ka object tree hai jo browser JS ko deta hai. querySelector se select, createElement se banao, textContent/classList se update. React isi DOM ko Virtual DOM se efficiently update karta hai."

---

## Select

```js
document.getElementById("app");
document.querySelector(".btn");      // first
document.querySelectorAll(".item");  // NodeList
```

`querySelectorAll` live nahi (static NodeList). `getElementsByClassName` live HTMLCollection.

---

## Create / insert / remove

```js
const el = document.createElement("div");
el.textContent = "Hello";
el.classList.add("box");
document.body.appendChild(el);
el.remove();
```

---

## Content vs HTML

| | `textContent` | `innerHTML` |
|--|---------------|-------------|
| Safe | Haan (text) | XSS risk |
| Parses HTML | Nahi | Haan |

User input `innerHTML` mein mat daalo.

---

## classList / attributes

```js
el.classList.add("active");
el.classList.toggle("open");
el.getAttribute("href");
el.setAttribute("alt", "pic");
el.style.color = "red"; // last resort; class better
```

---

## Forms

```js
input.value;
form.addEventListener("submit", (e) => {
  e.preventDefault();
});
```

Events detail: chapters 23–24.

---

## Interview Q&A

**Q1. DOM vs HTML?**  
→ HTML source text. DOM parsed live tree.

**Q2. textContent vs innerHTML?**  
→ text safe. innerHTML parse + XSS.

**Q3. querySelector vs getElementById?**  
→ ID fastest specific. querySelector CSS selector, flexible.

**Q4. React kyun DOM directly kam touch?**  
→ Diff + batch updates. Manual DOM scattered + slow.

---

## Ek Line Summary

> "DOM = live document tree. Select querySelector, mutate createElement/classList/textContent. innerHTML se XSS. Events delegation se scale."
