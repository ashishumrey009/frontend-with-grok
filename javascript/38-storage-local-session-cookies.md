# Chapter 38: localStorage vs sessionStorage vs Cookies

**Interviewer:** Teenon mein farak?

**Tum:**

"localStorage tab close ke baad bhi rehta hai. sessionStorage tab/session tak. Cookies chhote hote hain aur HTTP request ke saath server ko ja sakte hain. Storage sirf strings store karta hai — objects ke liye JSON."

---

## Comparison

| Feature | localStorage | sessionStorage | Cookies |
|---------|--------------|----------------|---------|
| Lifetime | Jab tak clear na karo | Tab/session | Expires / Max-Age |
| Size | ~5–10 MB | ~5–10 MB | ~4 KB |
| Sent with HTTP | ❌ | ❌ | ✅ |
| JS access | ✅ | ✅ | Haan, unless HttpOnly |
| Use | Theme, cache, prefs | Multi-step form (tab) | Auth session, tracking |

---

## localStorage / sessionStorage API

```js
localStorage.setItem("name", "Ashish");
localStorage.getItem("name");
localStorage.removeItem("name");
localStorage.clear();

// objects
localStorage.setItem("user", JSON.stringify({ name: "Ashish" }));
const user = JSON.parse(localStorage.getItem("user"));
```

Same methods `sessionStorage` pe.

---

## Cookies (short)

```js
document.cookie = "theme=dark; Max-Age=3600; Path=/; SameSite=Lax";
```

**Flags (interview):**
- `HttpOnly` → JS nahi padh sakta (XSS se token bachao)
- `Secure` → sirf HTTPS
- `SameSite=Strict|Lax|None` → CSRF control

---

## Interview Q&A

**Q1. Token localStorage mein rakhna?**  
→ XSS risk. HttpOnly cookie safer for auth.

**Q2. sessionStorage vs localStorage?**  
→ Session tab-specific + close pe gayab. Local persist.

**Q3. Storage mein object?**  
→ JSON.stringify / parse. Sirf strings.

---

## Ek Line Summary

> "local persist, session tab-only, cookies small + HTTP ke saath. Auth ke liye HttpOnly cookie better; prefs ke liye localStorage."
