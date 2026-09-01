# Chapter 44: Objects

**Interviewer:** Object methods + copy + destructure explain karo.

**Tum:**

"Object key-value pairs. Access dot ya bracket. Copy spread se shallow. Keys/values/entries se iterate. Destructuring se properties nikaalte hain."

---

```js
const user = { name: "Ashish", age: 25, address: { city: "Indore" } };

user.name;
user["age"];
user.role = "dev";
delete user.role;

"name" in user;
user.hasOwnProperty("name");
Object.hasOwn(user, "name"); // modern, safer
```

---

## Copy

```js
const shallow = { ...user }; // address same ref
const viaAssign = Object.assign({}, user);
const deep = structuredClone(user);
```

Deep clone detail: Chapter 26.

---

## Iterate

```js
Object.keys(user);    // ["name", "age", "address"]
Object.values(user);
Object.entries(user); // [["name", "Ashish"], ...]

for (const [k, v] of Object.entries(user)) {}
```

`for...in` prototype keys bhi — `hasOwn` check.

---

## Destructure + rest

```js
const { name, age: userAge, ...rest } = user;
const { address: { city } } = user;
```

---

## Optional chaining + nullish

```js
user.address?.city;
user.phone ?? "N/A"; // sirf null/undefined pe fallback (0 / "" nahi)
```

---

## Interview Q&A

**Q1. Spread copy deep hai?**  
→ Nahi, shallow.

**Q2. `in` vs hasOwnProperty?**  
→ `in` prototype bhi. hasOwn / hasOwnProperty sirf own.

**Q3. `??` vs `||`?**  
→ `||` falsy pe fallback (`0` bhi). `??` sirf null/undefined.

---

## Ek Line Summary

> "Objects reference types. Spread/assign shallow. keys/values/entries se loop. ?. aur ?? modern safe access."
