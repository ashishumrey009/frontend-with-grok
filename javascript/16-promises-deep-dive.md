# Chapter 16: Promises Deep Dive + Polyfill (Interview Style)

Interview mein Promises almost guaranteed topic hai. Yahan pe pure depth mein samjhate hain — jaise tum interviewer ko explain kar rahe ho.

---

## 1. Promise kya hota hai? (Simple Definition)

> A **Promise** is an object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value.

Simple words mein:

Promise ek **placeholder** hai future value ka.  
Woh value abhi nahi mili, lekin baad mein milegi (ya error aayega).

### Real life analogy:
Tumne pizza order kiya.
- Order place kiya → **Pending**
- Pizza aa gaya → **Fulfilled** (resolved)
- Pizza cancel / error → **Rejected**

---

## 2. Promise ke 3 States

| State       | Meaning                          | Kab hota hai              |
|-------------|----------------------------------|---------------------------|
| **Pending** | Initial state                    | Abhi tak settle nahi hua  |
| **Fulfilled** | Successfully completed         | `resolve()` call hua      |
| **Rejected**  | Failed                         | `reject()` call hua       |

Ek baar promise **settled** (fulfilled ya rejected) ho gaya, toh uska state **change nahi** hota.

---

## 3. Promise kaise banate hain?

```js
const promise = new Promise((resolve, reject) => {
  // async operation yahan
  const success = true;

  if (success) {
    resolve("Data mil gaya");   // fulfilled
  } else {
    reject("Kuch error aa gaya"); // rejected
  }
});
```

- `resolve(value)` → promise successful
- `reject(error)` → promise failed

---

## 4. Promise ko consume kaise karein?

### `.then()` + `.catch()`

```js
promise
  .then((result) => {
    console.log(result); // "Data mil gaya"
  })
  .catch((error) => {
    console.log(error);  // error handle
  })
  .finally(() => {
    console.log("Ye hamesha chalega");
  });
```

### Async/Await (modern way)

```js
async function getData() {
  try {
    const result = await promise;
    console.log(result);
  } catch (error) {
    console.log(error);
  } finally {
    console.log("Ye hamesha chalega");
  }
}
```

---

## 5. Promise Chaining

Har `.then()` ek **naya promise** return karta hai.

```js
Promise.resolve(5)
  .then((num) => num * 2)      // 10
  .then((num) => num + 3)      // 13
  .then((num) => console.log(num));
```

Agar beech mein error aaye toh seedha `.catch()` pe jump karta hai.

---

## 6. Important Promise Methods

### Promise.all()

Saare promises **successful** hone chahiye. Ek bhi fail hua toh poora fail.

```js
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(console.log); // [1, 2, 3]

Promise.all([
  Promise.resolve(1),
  Promise.reject("Error"),
  Promise.resolve(3)
]).catch(console.log); // "Error"
```

### Promise.allSettled()

Saare settle hone ka wait karta hai (success ya fail dono).

```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject("Error")
]).then(console.log);

/*
[
  { status: "fulfilled", value: 1 },
  { status: "rejected", reason: "Error" }
]
*/
```

### Promise.race()

Jo **sabse pehle** settle ho, uska result.

```js
Promise.race([
  new Promise(r => setTimeout(() => r("fast"), 100)),
  new Promise(r => setTimeout(() => r("slow"), 500))
]).then(console.log); // "fast"
```

### Promise.any()

Jo **sabse pehle successful** ho. Agar saare fail ho jayein toh AggregateError.

---

## 7. Common Interview Questions (Q + A)

**Q1. Promise kya hota hai?**  
Promise ek object hai jo asynchronous operation ke future result ko represent karta hai. Uske 3 states hote hain: pending, fulfilled, rejected.

**Q2. Promise vs Callback mein difference?**  
- Callbacks → inversion of control + callback hell  
- Promises → better error handling, chaining, readable code

**Q3. `.then()` kya return karta hai?**  
Hamesha ek **naya Promise**.

**Q4. Promise.all vs Promise.allSettled?**  
- `all` → ek bhi fail hua toh poora reject  
- `allSettled` → saare settle hone ka wait, result array deta hai

**Q5. Promise.race vs Promise.any?**  
- `race` → pehla settle (success ya fail)  
- `any` → pehla **successful**

**Q6. Kya promise ke state ko baad mein change kar sakte ho?**  
Nahi. Ek baar settled ho gaya toh permanent.

**Q7. `finally()` kab chalta hai?**  
Hamesha — success ho ya fail.

**Q8. Microtask vs Macrotask?**  
Promise callbacks **microtask** queue mein jate hain (setTimeout se pehle chalte hain).

```js
console.log("start");

setTimeout(() => console.log("timeout"), 0);

Promise.resolve().then(() => console.log("promise"));

console.log("end");

// Output: start → end → promise → timeout
```

---

## 8. Promise Polyfill (Interview Style)

Interview mein basic Promise polyfill poochhte hain. Yeh simple version hai:

```js
function MyPromise(executor) {
  let onResolve, onReject;
  let isFulfilled = false;
  let isRejected = false;
  let isCalled = false;
  let value;
  let error;

  function resolve(val) {
    isFulfilled = true;
    value = val;

    if (typeof onResolve === "function" && !isCalled) {
      onResolve(value);
      isCalled = true;
    }
  }

  function reject(err) {
    isRejected = true;
    error = err;

    if (typeof onReject === "function" && !isCalled) {
      onReject(error);
      isCalled = true;
    }
  }

  this.then = function (callback) {
    onResolve = callback;

    if (isFulfilled && !isCalled) {
      onResolve(value);
      isCalled = true;
    }
    return this; // basic chaining support
  };

  this.catch = function (callback) {
    onReject = callback;

    if (isRejected && !isCalled) {
      onReject(error);
      isCalled = true;
    }
    return this;
  };

  try {
    executor(resolve, reject);
  } catch (err) {
    reject(err);
  }
}
```

### Test

```js
const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("Success!");
  }, 1000);
});

p.then((res) => console.log(res))   // Success!
 .catch((err) => console.log(err));
```

---

## 9. Better Polyfill Points (Interview mein bolna)

Upar wala **basic** version hai. Real Promise mein yeh extra cheezein hoti hain:

1. Proper chaining (`then` hamesha naya promise return kare)
2. Multiple `then` callbacks support
3. Async resolution (microtask)
4. `finally` support
5. `Promise.resolve` / `Promise.reject` static methods

Agar interviewer advanced maange toh bolna:

> "Basic version mein state + then/catch handle kiya hai. Production level pe chaining aur microtask queue bhi implement karni padti hai."

---

## 10. Output Based Questions (Practice)

**Q1.**
```js
console.log(1);

Promise.resolve().then(() => console.log(2));

console.log(3);

// Output: 1 3 2
```

**Q2.**
```js
Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => { throw new Error("Error") })
  .then((x) => console.log(x))
  .catch((err) => console.log(err.message));

// Output: Error
```

**Q3.**
```js
async function test() {
  return 5;
}

test().then(console.log); // 5
```

---

## 11. Key Takeaways (Interview ke liye)

- Promise = future value ka representative
- 3 states: pending → fulfilled / rejected
- `.then()` hamesha naya promise return karta hai
- `Promise.all` → fail-fast
- `Promise.allSettled` → sabka result chahiye
- Promises microtask queue mein chalte hain
- Polyfill mein minimum: state + resolve/reject + then/catch

---

**Related Chapters:**  
- [05 - Closures](./05-closures-deep-dive.md)  
- [11 - Functions Deep Dive](./11-functions-deep-dive.md)
