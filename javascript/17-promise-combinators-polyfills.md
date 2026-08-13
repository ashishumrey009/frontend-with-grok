# Chapter 17: Promise Combinators Polyfills
# (Promise.all | allSettled | race | any)

Bhai, yeh 4 methods interview mein **bahut** puchte hain.
Main story + interview style mein samjhata hoon + pure polyfills deta hoon.

---

## Pehle Quick Comparison (Yaad rakh lo)

| Method              | Kab settle hota hai?          | Success pe kya milta hai?          | Fail pe kya hota hai?          |
|---------------------|-------------------------------|------------------------------------|--------------------------------|
| **Promise.all**     | Sab success **ya** pehla fail | Array of results (order same)     | Pehla error se turant reject   |
| **Promise.allSettled** | Sab settle (success + fail) | Array of `{status, value/reason}` | Kabhi reject nahi hota         |
| **Promise.race**    | Jo pehle settle ho            | Pehle wale ka value ya error      | Pehle wale ke hisaab se        |
| **Promise.any**     | Pehla success **ya** sab fail | Pehle successful ka value         | AggregateError (sab errors)    |

---

## 1. Promise.all Polyfill

**Story:**
Tum 3 dost se pizza, burger aur coke mangwa rahe ho.
Agar **sab** aa gaye → khush, sab khana table pe.
Agar **kisi ek** ne mana kar diya → pura plan cancel.

**Interview Style:**

**Interviewer:** Promise.all ka polyfill banao.

**Tum:**

```js
Promise.myAll = function (promises) {
  return new Promise((resolve, reject) => {
    // Edge case: empty array
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    const results = new Array(promises.length);
    let completed = 0;

    promises.forEach((p, index) => {
      // Non-promise values bhi handle karo
      Promise.resolve(p)
        .then((value) => {
          results[index] = value;
          completed++;

          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch((err) => {
          // Pehla error aate hi reject
          reject(err);
        });
    });
  });
};
```

**Key Points (Interview mein bolna):**
- `Promise.resolve(p)` isliye → non-promise values bhi support
- `results[index]` → order maintain karne ke liye
- `completed` counter → sab complete hone ka wait
- Koi ek bhi reject → turant reject (short-circuit)

---

## 2. Promise.allSettled Polyfill

**Story:**
Tum 3 doston se order mangwa rahe ho.
Koi aaye ya na aaye — **sabka status** jaanna hai.
Koi fail ho toh bhi baaki ka wait karoge.

**Interview Style:**

```js
Promise.myAllSettled = function (promises) {
  return new Promise((resolve) => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    const results = new Array(promises.length);
    let completed = 0;

    promises.forEach((p, index) => {
      Promise.resolve(p)
        .then((value) => {
          results[index] = { status: "fulfilled", value };
        })
        .catch((reason) => {
          results[index] = { status: "rejected", reason };
        })
        .finally(() => {
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        });
    });
  });
};
```

**Short version (using Promise.all):**

```js
Promise.myAllSettled = function (promises) {
  const mapped = promises.map((p) =>
    Promise.resolve(p)
      .then((value) => ({ status: "fulfilled", value }))
      .catch((reason) => ({ status: "rejected", reason }))
  );
  return Promise.all(mapped);
};
```

**Key Points:**
- Kabhi reject nahi hota
- Hamesha array of objects milta hai
- Real life mein partial success ke liye best

---

## 3. Promise.race Polyfill

**Story:**
3 dost race kar rahe hain.
Jo **pehle** finish kare (chahe jeet ya haar) → uska result final.

**Interview Style:**

```js
Promise.myRace = function (promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      // Spec ke hisaab se pending rehta hai, lekin practical mein:
      return;
    }

    promises.forEach((p) => {
      Promise.resolve(p)
        .then(resolve)   // pehla success
        .catch(reject);  // pehla fail
    });
  });
};
```

**Key Points:**
- Sabse simple polyfill
- Timeout implement karne ke liye bahut use hota hai

**Timeout Example (Interview bonus):**

```js
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout!")), ms);
  });
  return Promise.race([promise, timeout]);
}
```

---

## 4. Promise.any Polyfill

**Story:**
Tum 3 backup servers se data mangwa rahe ho.
Jo **pehle success** de → uska data lo.
Agar **sab fail** ho jaaye → tabhi error do.

**Interview Style:**

```js
Promise.myAny = function (promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      reject(new AggregateError([], "All promises were rejected"));
      return;
    }

    const errors = [];
    let rejectedCount = 0;

    promises.forEach((p, index) => {
      Promise.resolve(p)
        .then((value) => {
          // Pehla success aate hi resolve
          resolve(value);
        })
        .catch((err) => {
          errors[index] = err;
          rejectedCount++;

          // Sab fail ho gaye toh AggregateError
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, "All promises were rejected"));
          }
        });
    });
  });
};
```

**Key Points:**
- Pehla success → resolve
- Sab fail → AggregateError (errors array ke saath)
- Backup APIs / fallback ke liye perfect

---

## Interview Mein Common Questions

**Q1. Promise.all vs Promise.allSettled?**
- `all` → ek bhi fail → pura reject
- `allSettled` → sabka result deta hai, kabhi reject nahi

**Q2. Promise.race vs Promise.any?**
- `race` → pehla settle (success ya fail dono)
- `any` → pehla **success** only. Fail ignore karta hai jab tak sab fail na ho

**Q3. Empty array pe kya hota hai?**
- `Promise.all([])` → immediately resolve with `[]`
- `Promise.allSettled([])` → immediately resolve with `[]`
- `Promise.race([])` → forever pending
- `Promise.any([])` → immediately reject with AggregateError

**Q4. Non-promise values?**
- Sab methods `Promise.resolve()` se wrap karte hain, isliye normal values bhi chal jaate hain.

---

## Full Working Code (Copy-Paste Ready)

```js
// ========== Promise.all ==========
Promise.myAll = function (promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);

    const results = new Array(promises.length);
    let completed = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then((val) => {
          results[i] = val;
          completed++;
          if (completed === promises.length) resolve(results);
        })
        .catch(reject);
    });
  });
};

// ========== Promise.allSettled ==========
Promise.myAllSettled = function (promises) {
  return new Promise((resolve) => {
    if (promises.length === 0) return resolve([]);

    const results = new Array(promises.length);
    let completed = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then((value) => {
          results[i] = { status: "fulfilled", value };
        })
        .catch((reason) => {
          results[i] = { status: "rejected", reason };
        })
        .finally(() => {
          completed++;
          if (completed === promises.length) resolve(results);
        });
    });
  });
};

// ========== Promise.race ==========
Promise.myRace = function (promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((p) => {
      Promise.resolve(p).then(resolve, reject);
    });
  });
};

// ========== Promise.any ==========
Promise.myAny = function (promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      return reject(new AggregateError([], "All promises were rejected"));
    }

    const errors = [];
    let rejectedCount = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(resolve)
        .catch((err) => {
          errors[i] = err;
          rejectedCount++;
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, "All promises were rejected"));
          }
        });
    });
  });
};
```

---

## Ek Line Summary (Interview mein yeh bol dena)

> "`all` = sab success chahiye, `allSettled` = sabka status chahiye, `race` = jo pehle settle ho, `any` = jo pehle success ho."

Bhai yeh 4 polyfills solid se yaad kar lo — interview clear!
