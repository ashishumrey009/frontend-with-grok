# Chapter 27: Class and Constructor (Full Details + Interview Questions)

**Interviewer:** Class aur Constructor explain karo.

**Tum:**

"Class ek blueprint hai objects banane ka. Constructor special method hai jo object banate time automatically chalta hai aur properties set karta hai."

---

## 1. Basic Class

```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(`Hi, I am ${this.name}`);
  }
}

const p1 = new Person("Ashish", 25);
p1.greet(); // Hi, I am Ashish
```

---

## 2. Constructor

`constructor` object create hote time automatically call hota hai.

**Rules:**
- Class mein sirf **ek** constructor hota hai
- Agar nahi likho toh empty constructor milta hai
- `new` ke bina class call karoge toh TypeError aayega

```js
class Person {
  constructor(name) {
    this.name = name;
  }
}

const p1 = new Person("Ashish"); // OK
Person("Ashish"); // Error! Class constructor cannot be invoked without 'new'
```

---

## 3. Methods + Static Methods

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  // Instance method
  greet() {
    console.log(`Hi ${this.name}`);
  }

  // Static method (class pe call, object pe nahi)
  static info() {
    console.log("This is Person class");
  }
}

const p1 = new Person("Ashish");
p1.greet();     // Hi Ashish
Person.info();  // This is Person class
p1.info();      // Error!
```

---

## 4. Inheritance (`extends` + `super`)

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);        // parent constructor (zaroori!)
    this.breed = breed;
  }

  speak() {
    console.log(`${this.name} barks`);
  }
}

const d1 = new Dog("Tommy", "Labra");
d1.speak(); // Tommy barks
```

**`super()` kyun zaroori hai?**  
Child constructor mein `this` use karne se pehle parent constructor call karna padta hai.

---

## 5. Private Fields (`#`)

```js
class BankAccount {
  #balance = 0; // private

  constructor(owner) {
    this.owner = owner;
  }

  deposit(amount) {
    this.#balance += amount;
  }

  getBalance() {
    return this.#balance;
  }
}

const acc = new BankAccount("Ashish");
acc.deposit(1000);
console.log(acc.getBalance()); // 1000
console.log(acc.#balance);     // Error! Private
```

---

## 6. Getters & Setters

```js
class Person {
  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name.toUpperCase();
  }

  set name(value) {
    if (value.length < 2) throw new Error("Name too short");
    this._name = value;
  }
}

const p = new Person("ashish");
console.log(p.name); // ASHISH
p.name = "Rahul";
```

---

## 7. Class vs Constructor Function (Under the Hood)

```js
// Class
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log(this.name);
  }
}

// Exactly same as:
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function () {
  console.log(this.name);
};
```

**Matlab:** Class sirf syntactic sugar hai. Andar se prototype hi use hota hai.

```js
typeof Person; // "function"
Person.prototype.greet; // function
```

---

## 8. Class vs Function — Differences

| Feature          | Class                    | Constructor Function      |
|------------------|--------------------------|---------------------------|
| `new` zaroori    | Haan (bina error)        | Nahi (but wrong behavior) |
| Hoisting         | Nahi (TDZ)               | Haan                      |
| Methods          | Auto prototype pe        | Manually prototype pe     |
| Strict mode      | Automatic                | Optional                  |
| Syntax           | Clean                    | Verbose                   |

---

## 9. Common Interview Questions

**Q1. Class kya hai?**  
→ Objects banane ka blueprint. Andar se prototype based hai.

**Q2. Constructor ka kaam?**  
→ Object create hote time properties initialize karna. `new` se auto call hota hai.

**Q3. `super()` kyun call karte hain?**  
→ Parent constructor chalane ke liye. `this` se pehle zaroori hai.

**Q4. Class vs Constructor Function?**  
→ Syntax ka farak. Dono prototype use karte hain. Class ko `new` ke bina call nahi kar sakte.

**Q5. Static method kya hai?**  
→ Class pe call hota hai, instance pe nahi.

**Q6. Private field kaise banate ho?**  
→ `#` se. Bahar se access nahi hota.

**Q7. Class hoist hoti hai?**  
→ Nahi. TDZ mein rehti hai (jaise let/const).

**Q8. Methods prototype pe jaate hain ya har object pe?**  
→ Prototype pe. Memory efficient.

---

## Ek Line Summary

> "Class objects ka blueprint hai. Constructor object banate time chalta hai. Inheritance extends + super se hoti hai. Andar se class bhi prototype hi use karti hai — sirf syntax clean hai."
