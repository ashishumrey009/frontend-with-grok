# Chapter 13: Arrow Functions + `this` Behavior

Arrow functions ES6 ka important feature hai. Syntax short hai, lekin `this` ka behavior regular functions se bilkul alag hai.

---

## 1. What is an Arrow Function?

Arrow function ek short syntax hai function likhne ka.

### Regular Function
```js
function add(a, b) {
  return a + b;
}
```

### Arrow Function
```js
const add = (a, b) => {
  return a + b;
};
```

### Even shorter (implicit return)
```js
const add = (a, b) => a + b;
```

---

## 2. Syntax Variations

```js
// No parameter
const sayHi = () => console.log("Hi");

// One parameter (parentheses optional)
const square = x => x * x;

// Multiple parameters
const add = (a, b) => a + b;

// Multiple lines (return likhna padega)
const process = (a, b) => {
  const sum = a + b;
  return sum * 2;
};

// Returning object (parentheses zaroori)
const createUser = (name, age) => ({ name, age });
```

---

## 3. Biggest Difference: `this` Behavior

Regular functions ka `this` **dynamic** hota hai (kaise call hua uspe depend karta hai).

Arrow functions ka `this` **lexical** hota hai (jahan function likha gaya hai, wahan ka `this` le leta hai).

### Example 1: Regular Function (Problem)

```js
const user = {
  name: "Ashish",
  greet: function() {
    setTimeout(function() {
      console.log("Hello " + this.name);
    }, 100);
  }
};

user.greet(); // Hello undefined
```

Kyunki `setTimeout` ke andar wala function apna alag `this` banata hai (window/undefined).

### Example 2: Arrow Function (Solution)

```js
const user = {
  name: "Ashish",
  greet: function() {
    setTimeout(() => {
      console.log("Hello " + this.name);
    }, 100);
  }
};

user.greet(); // Hello Ashish
```

Arrow function ne surrounding `greet` method ka `this` inherit kar liya.

---

## 4. Arrow Function in Different Scenarios

### Scenario 1: Object Method ke roop mein (Avoid karo)

```js
const user = {
  name: "Ashish",
  greet: () => {
    console.log(this.name);
  }
};

user.greet(); // undefined
```

**Kyun?** Arrow function ke paas apna `this` nahi hota. Woh surrounding scope (global) ka `this` le leta hai.

**Sahi tarika:**
```js
const user = {
  name: "Ashish",
  greet() {                    // regular method
    console.log(this.name);
  }
};
```

---

### Scenario 2: Callback / setTimeout / Event Listener (Best use)

```js
const button = document.getElementById("btn");
const user = { name: "Ashish" };

button.addEventListener("click", () => {
  console.log(this); // surrounding this (mostly window)
});
```

Agar method ke andar use kar rahe ho toh lexical `this` milta hai — yeh bahut useful hai.

---

### Scenario 3: Constructor Function (Kaam nahi karega)

```js
const Person = (name) => {
  this.name = name;
};

const p = new Person("Ashish"); // Error: Person is not a constructor
```

Arrow functions ko `new` ke saath use **nahi** kar sakte.

---

### Scenario 4: Prototype Methods (Avoid)

```js
function User(name) {
  this.name = name;
}

User.prototype.greet = () => {
  console.log(this.name);
};

const u = new User("Ashish");
u.greet(); // undefined
```

---

### Scenario 5: Arguments Object

Arrow functions ke paas apna `arguments` object **nahi** hota.

```js
function regular() {
  console.log(arguments); // works
}

const arrow = () => {
  console.log(arguments); // Error: arguments is not defined
};
```

Rest parameters use karo:
```js
const arrow = (...args) => {
  console.log(args);
};
```

---

### Scenario 6: call, apply, bind ke saath

Arrow function `call`, `apply`, `bind` se `this` change **nahi** hota.

```js
const arrow = () => {
  console.log(this.name);
};

arrow.call({ name: "Ashish" }); // undefined (global this)
```

---

## 5. Regular Function vs Arrow Function

| Feature                  | Regular Function          | Arrow Function              |
|--------------------------|---------------------------|-----------------------------|
| `this`                   | Dynamic (call site)       | Lexical (surrounding)       |
| `arguments` object       | Hota hai                  | Nahi hota                   |
| `new` keyword            | Use kar sakte ho          | Nahi use kar sakte          |
| Hoisting                 | Declaration hoisted       | Expression (not hoisted)    |
| Prototype                | Hota hai                  | Nahi hota                   |
| call/apply/bind          | `this` change ho sakta    | `this` change nahi hota     |
| Syntax                   | Verbose                   | Short                       |

---

## 6. When to Use Arrow Functions

**Use karo jab:**
- Callbacks mein (`map`, `filter`, `setTimeout`, event listeners)
- Short one-liner functions chahiye
- Lexical `this` chahiye (method ke andar)

**Avoid karo jab:**
- Object methods bana rahe ho
- Constructor functions
- Prototype methods
- Jab dynamic `this` chahiye
- Jab `arguments` object chahiye

---

## 7. Interview Questions

**Q1. Arrow function aur regular function mein main difference kya hai?**  
Arrow function ka `this` lexical hota hai, regular function ka dynamic.

**Q2. Kya arrow function ko constructor bana sakte ho?**  
Nahi. `new` ke saath use nahi kar sakte.

**Q3. Arrow function mein `this` kaise decide hota hai?**  
Jahan function likha gaya hai (surrounding scope), wahan ka `this` le leta hai.

**Q4. Kya `call`/`apply`/`bind` se arrow function ka `this` change ho sakta hai?**  
Nahi.

**Q5. Is code ka output kya hoga?**
```js
const obj = {
  name: "Ashish",
  say: () => {
    console.log(this.name);
  }
};
obj.say();
```
**Answer:** `undefined` (global this)

**Q6. Is code ka output kya hoga?**
```js
const obj = {
  name: "Ashish",
  say: function() {
    const inner = () => console.log(this.name);
    inner();
  }
};
obj.say();
```
**Answer:** `Ashish` (arrow ne surrounding `this` liya)

---

## 8. Key Takeaways

- Arrow function = short syntax + lexical `this`
- Object methods ke liye regular function better hai
- Callbacks ke liye arrow function best hai
- `new`, `arguments`, `prototype` → arrow mein nahi milte
- `call`/`apply`/`bind` arrow ke `this` ko change nahi kar sakte

---

**Related Chapters:**  
- [07 - this + call/apply/bind](./07-this-call-apply-bind.md)  
- [11 - Functions Deep Dive](./11-functions-deep-dive.md)
