# Chapter 16: Promises Deep Dive + Polyfill (Interview Conversation Style)

Bhai, ekdum interview style mein — jaise real conversation ho!

---

## Interviewer: "Promise ka Polyfill banao"

**Tum:**

"Sure! Before coding, let me quickly walk you through my approach."

"Promise basically ek object hai jo ek async operation ka future result represent karta hai. Iske 3 states hote hain — `pending`, `fulfilled`, `rejected`. Aur ek baar state change ho jaye toh dobara nahi badalti."

"Toh main basically ek class banunga jo yahi behavior implement kare."

---

### Step 1 — Constructor

```js
class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
```

**Interviewer:** "Yeh callbacks array kyun rakha?"

**Tum:**

"Great question! Dekho — Promise mostly async hota hai. Matlab jab hum `.then()` likhte hain, tab tak Promise ka result aaya hi nahi hota. Toh agar main callbacks store nahi karunga toh woh lost ho jaayenge!"

"Example se samjho:"

```js
const p = new MyPromise((resolve) => {
  setTimeout(() => resolve("data"), 1000);
  // 1 second baad resolve hoga
});

p.then(val => console.log(val));
// .then() ABHI call hua
// but resolve 1 second BAAD hoga!
// Isliye callback store karna padega!
```

"Isliye array rakha — baad mein jab resolve/reject call ho tab yeh sab chalenge!"

---

### Step 2 — resolve aur reject

```js
const resolve = (value) => {
  if (this.state === "pending") {
    this.state = "fulfilled";
    this.value = value;
    this.onFulfilledCallbacks.forEach(fn => fn(value));
  }
};

const reject = (reason) => {
  if (this.state === "pending") {
    this.state = "rejected";
    this.reason = reason;
    this.onRejectedCallbacks.forEach(fn => fn(reason));
  }
};
```

**Interviewer:** "Yeh `if(state === 'pending')` kyun check kiya?"

**Tum:**

"Yeh Promise ki core property hai — **immutability of state**."

"Ek baar Promise resolve ho gaya toh dobara resolve ya reject nahi ho sakta. Bina is check ke yeh ho sakta tha:"

```js
const p = new MyPromise((resolve, reject) => {
  resolve("first");   // ✅ yeh chalega
  reject("second");   // ❌ yeh nahi chalna chahiye!
  resolve("third");   // ❌ yeh bhi nahi!
});
```

"Is guard ke saath sirf pehla wala chalega — baaki ignore ho jaayenge!"

**Interviewer:** "Yeh `forEach` kyun?"

**Tum:**

"Kyunki ek Promise pe multiple `.then()` lag sakte hain!"

```js
const p = new MyPromise((resolve) => {
  setTimeout(() => resolve("data"), 1000);
});

p.then(val => console.log("First:", val));
p.then(val => console.log("Second:", val));
p.then(val => console.log("Third:", val));
// Teeno chalenge!
```

"Isliye array mein store kiye — `forEach` se saare ek saath chalenge!"

---

### Step 3 — Executor try-catch

```js
try {
  executor(resolve, reject);
} catch (err) {
  reject(err);
}
```

**Interviewer:** "try-catch kyun wrap kiya?"

**Tum:**

"Defensive programming! Agar executor ke andar koi synchronous error aaye toh Promise automatically reject ho jaye."

```js
const p = new MyPromise((resolve) => {
  throw new Error("Oops!"); // executor mein error!
});

p.catch(err => console.log(err.message));
// "Oops!" ← try-catch ki wajah se catch hua!
```

"Bina try-catch ke yeh error unhandled reh jaata!"

---

### Step 4 — `.then()`

```js
then(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === "function"
    ? onFulfilled
    : value => value;

  onRejected = typeof onRejected === "function"
    ? onRejected
    : reason => { throw reason; };

  return new MyPromise((resolve, reject) => {
    if (this.state === "fulfilled") {
      try {
        resolve(onFulfilled(this.value));
      } catch (err) {
        reject(err);
      }
    }

    if (this.state === "rejected") {
      try {
        resolve(onRejected(this.reason));
      } catch (err) {
        reject(err);
      }
    }

    if (this.state === "pending") {
      this.onFulfilledCallbacks.push(() => {
        try {
          resolve(onFulfilled(this.value));
        } catch (err) {
          reject(err);
        }
      });

      this.onRejectedCallbacks.push(() => {
        try {
          resolve(onRejected(this.reason));
        } catch (err) {
          reject(err);
        }
      });
    }
  });
}
```

**Interviewer:** "Yeh `typeof` check kyun?"

**Tum:**

"Yeh Promise chaining ke liye zaroori hai. Kabhi kabhi log `.then()` mein function nahi dete:"

```js
promise
  .then()                      // kuch nahi diya!
  .then(val => console.log(val)); // phir bhi kaam kare!
```

"Agar main check nahi karunga aur directly `onFulfilled(value)` call karunga toh crash ho jaayega."

"Toh default de deta hoon — value ko aage pass karo, error ko aage throw karo. Isse **transparent passthrough** kehte hain!"

**Interviewer:** "Naya Promise kyun return kar rahe ho?"

**Tum:**

"Yahi chaining ka secret hai! Agar main naya Promise return nahi karunga toh yeh nahi ho sakta:"

```js
promise
  .then(val => val + 1)
  .then(val => val + 1)
  .then(val => val + 1);
```

"Har `.then()` naya Promise return karta hai jis pe agla `.then()` lag sakta hai. Yahi chaining hai!"

**Interviewer:** "3 cases kyun hain?"

**Tum:**

"Timing ki wajah se! `.then()` kab call hoga pata nahi:"

**Case 1 — Already fulfilled** (Synchronous Promise)

```js
const p = new MyPromise((resolve) => {
  resolve("sync!"); // synchronous resolve
});
p.then(val => console.log(val));
// state pehle se fulfilled hai!
```

**Case 2 — Already rejected**

Same logic — pehle se reject ho chuka tha.

**Case 3 — Pending** (Async Promise)

```js
const p = new MyPromise((resolve) => {
  setTimeout(() => resolve("async!"), 1000);
});
p.then(val => console.log(val));
// state abhi pending hai!
// callback store karo!
```

---

### Step 5 — `.catch()` aur `.finally()`

```js
catch(onRejected) {
  return this.then(null, onRejected);
}

finally(callback) {
  return this.then(
    value => {
      callback();
      return value;
    },
    reason => {
      callback();
      throw reason;
    }
  );
}
```

**Interviewer:** "`.catch()` itna chhota kyun hai?"

**Tum:**

"Kyunki `.catch()` basically `.then()` ka shortcut hai! `.then()` ke 2 arguments hote hain — success aur failure. `.catch()` sirf failure handle karta hai toh pehla argument `null` de do — kaam ho gaya!"

**Interviewer:** "`finally` mein value return aur reason throw kyun?"

**Tum:**

"Kyunki `.finally()` chain ko break nahi karna chahiye!"

```js
promise
  .then(val => val + 1)
  .finally(() => console.log("cleanup!"))
  .then(val => console.log(val)); // yeh bhi chalna chahiye!
```

"Agar main value return nahi karunga toh chain toot jaayegi — agla `.then()` undefined milega!"

"Aur error throw karna isliye zaroori hai taaki `.catch()` usse pakad sake!"

---

### Interviewer: "Koi edge case?"

**Tum:**

"Haan! 3 important edge cases hain:"

```js
// Edge Case 1: Resolve ke baad reject
new MyPromise((resolve, reject) => {
  resolve("first");   // ✅ chalega
  reject("ignored");  // ❌ ignore hoga
});

// Edge Case 2: then() mein error
new MyPromise((resolve) => resolve(1))
  .then(val => { throw new Error("oops!") })
  .catch(err => console.log(err.message));
// "oops!" ← try-catch ne pakda!

// Edge Case 3: then() bina argument ke
new MyPromise((resolve) => resolve(42))
  .then()
  .then(val => console.log(val)); // 42 ← passthrough!
```

---

## Full Working Code (Ek saath)

```js
class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn(value));
      }
    };

    const reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn(reason));
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected = typeof onRejected === "function" ? onRejected : reason => { throw reason; };

    return new MyPromise((resolve, reject) => {
      if (this.state === "fulfilled") {
        try {
          resolve(onFulfilled(this.value));
        } catch (err) {
          reject(err);
        }
      }

      if (this.state === "rejected") {
        try {
          resolve(onRejected(this.reason));
        } catch (err) {
          reject(err);
        }
      }

      if (this.state === "pending") {
        this.onFulfilledCallbacks.push(() => {
          try {
            resolve(onFulfilled(this.value));
          } catch (err) {
            reject(err);
          }
        });

        this.onRejectedCallbacks.push(() => {
          try {
            resolve(onRejected(this.reason));
          } catch (err) {
            reject(err);
          }
        });
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(
      value => {
        callback();
        return value;
      },
      reason => {
        callback();
        throw reason;
      }
    );
  }
}
```

---

## Ek Line Summary (Interview mein yeh bolna)

> "Promise ek state machine hai — pending se fulfilled ya rejected. Callbacks array isliye kyunki async hai. `then()` naya Promise return karta hai isliye chaining possible hai. Aur 3 cases isliye kyunki timing unpredictable hai!"

Bhai yeh bol diya toh interviewer impress ho jaayega!
