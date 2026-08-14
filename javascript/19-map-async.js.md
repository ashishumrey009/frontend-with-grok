# Chapter 19: mapAsync (Async Map)

Bhai, yeh interview mein bahut aata hai.

**Problem:**  
Normal `Array.map` jaisa function banao, lekin callback **async** hoga (Promise return karega).  
Order maintain hona chahiye. Agar koi bhi promise fail ho jaye toh pura reject ho jana chahiye.

---

## Solution 1: Detailed Version (Interview mein explain karne layak)

```js
function mapAsync(iterable, callbackFn) {
  return new Promise((resolve, reject) => {
    const results = new Array(iterable.length);
    let unresolved = iterable.length;

    // Edge case: empty array
    if (unresolved === 0) {
      resolve(results);
      return;
    }

    iterable.forEach((item, index) => {
      // callbackFn Promise return karega
      Promise.resolve(callbackFn(item))
        .then((value) => {
          results[index] = value;   // order maintain
          unresolved--;

          if (unresolved === 0) {
            resolve(results);
          }
        })
        .catch((err) => {
          reject(err);              // koi bhi fail → pura reject
        });
    });
  });
}
```

### Kaise kaam karta hai?

1. Ek naya Promise return kiya.
2. `results` array banaya (length same rakhi taaki **order** maintain ho).
3. `unresolved` counter rakha — kitne promises abhi pending hain.
4. Har item pe `callbackFn` chala diya.
5. Jab koi resolve hota hai → uske index pe result daal diya + counter kam kiya.
6. Jab counter 0 ho jaye → saare complete → `resolve(results)`.
7. Koi bhi reject hua toh turant `reject`.

---

## Solution 2: Short & Clean Version (Recommended)

```js
function mapAsync(iterable, callbackFn) {
  return Promise.all(iterable.map(callbackFn));
}
```

Yeh bilkul same kaam karta hai. Interview mein yeh bhi chalta hai, lekin pehle wala version explain karne se interviewer impress hota hai.

---

## Example

```js
const nums = [1, 2, 3, 4];

function doubleAsync(num) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(num * 2);
    }, 1000);
  });
}

mapAsync(nums, doubleAsync).then((result) => {
  console.log(result); // [2, 4, 6, 8]
});
```

---

## Interview Tips

- `results[index]` se **order** maintain hota hai.
- `unresolved` counter se pata chalta hai kab saare complete hue.
- `Promise.resolve()` isliye lagaya taaki agar koi normal value bhi de toh handle ho jaye.
- Empty array handle karna mat bhoolna.
- Error handling (reject) mat bhoolna.

---

## Related Questions

- `mapAsyncLimit` (concurrency limit ke saath)
- `Promise.all` polyfill
- `async series` / `async parallel`

Next chapter mein `mapAsyncLimit` karenge.
