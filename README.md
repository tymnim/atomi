# atomi

A reactivity framework.

# Installation

```bash
npm i atomi
```

# Example

```js
import { atom, reactive } from "atomi"

const [counter, setCounter, setCounterFn] = atom(0)

reactive(() => {
  console.log(`counter is: ${counter()}`)
})

await setCounter(1) // Logs `counter is: 1`
await setCounterFn(count => count + 1) // Logs `counter is: 2`
```

# References

## Hooks

This is the part that majority of users are going to interact with.

### `reactive`

- [src/hooks.mjs#6](https://github.com/tymnim/atomi/blob/master/src/hooks.mjs#L6)
- Accept `(scope) => undefined`
- Return `Promise<Scope>` or `Scope`

```js
import { reactive } from "atomi"
```

> Used to create reactive functions. Reactive functions are such functions that execute automatically when [atoms](#atom) inside them change their value

| Argument | Type | Desc |
|---|:---|:---|
| callback | `[async] Function` | Called when atoms inside change Accepts a single argument [scope](#Scope) |
| ignoreAsync | `Boolean` | By default is `false`. If `true` is passed return will be always [scope](#Scope) even if callback resovles into `Promise` |

Returns [scope](#Scope) or `Promise` that resolves into [scope](#Scope) when `callback` is `async` or returns `Promise`

```js
reactive(scope => {
  const value = dependantAtom()
  scope.stop()
})
```

### `atom`

- [src/hooks.mjs#53](https://github.com/tymnim/atomi/blob/master/src/hooks.mjs#L82)
- Accept `Any`
- Return `[() => Any, (value) => Promise, (Function) => Promise]`

```js
import { atom } from "atomi"
```

> Atoms are used to store information. When they are accessed from inside reactive functions, atom registers function's scope as dependency. Any time atom is updated, it's functions of dependant scopes are executed.

| Argument | Type | Desc |
|---|:---|:---|
| Default Value | `Any` | Intial value of atom |

Returns Array of getter, setter and callback setter functions

- `getter function` that returns current value of the atom and registers current scope as dependecy if current scope exists
- `setter function` accepts a value that will become new value of the atom. Returns a `Promise` that fulfills when all dependant scopes of the atom are executed
- `callback setter` accepts a callback function that accepts 2 arguments and that returns new value for the atom or `NONE`. Returns a `Promise` that fulfills when all dependant scopes of the atom are executed

#### callback setter

| Argument | Type | Desc |
|---|:---|:---|
| Current Value | `Any` | The current value of atom |
| `NONE` | `Symbol` | Unique symbol. If `NONE` is returned the atom retains it's value and reactive updates will not follow |

Returns `Any` or `NONE`

```js
const [count, setCount, setCountFn] = atom(0)
reactive(function logCount() {
  // getter function
  console.log(count())
})
// setter function
await setCount(2)
// callback setter function
await setCountFn((current, NONE) => current + 1) // Sets count to 3 and triggers logCount to execute
await setCountFn((current, NONE) => NONE) // Count stays at 3 and logCount is not triggered.
// NONE is useful when the complex logic produces the same value as current
// and hence we do not want to update anything because it says the same.
```

### `new atom`

- [src/hooks.mjs#53](https://github.com/tymnim/atomi/blob/master/src/hooks.mjs#L82)
- Accept `Any`
- Return [RectiveVar](#ReactiveVar)

```js
import { atom } from "atomi"
```

| Argument | Type | Desc |
|---|:---|:---|
| Default Value | `Any` | Intial value of atom |

Returns [RectiveVar](#ReactiveVar) with default value

```js
const count = new atom(0)
reactive(function logCount() {
  console.log(count.get())
})
await count.set(1) // sets atom count value to 1 and triggers logCount
```

### `nonreactive`

- [src/hooks.mjs#45](https://github.com/tymnim/atomi/blob/master/src/hooks.mjs#L46)
- Accept `Function`
- Return `Any`

```js
import { nonreactive } from "atomi"
```

> Used as wrapper around an atom to access its value, but not register current scope as its dependency

| Argument | Type | Desc |
|---|:---|:---|
| Callback | `Function` | Getter function or atomic function |

Returns the return value of the callback function

```js
const [count, setCount] = atom(0)
const [increment, setIncrement] = atom(1)
reactive(() => {
  console.log(`count is ${count() + nonreactive(increment)}`)
})

await setCount(current => 1) // triggers the reactive function and logs `count is 2`
await setIncrement(2) // does not trigger the reactive function
await setCount(current => 2) // triggers the reactive function and logs `count is 4`
```

### `guard`

- [src/hooks.mjs#45](https://github.com/tymnim/atomi/blob/master/src/hooks.mjs#L57)
- Accept `Function`, `Function`
- Return `Any`

```js
import { guard } from "atomi"
```

> Used as wrapper around an atom or a function to access its value, but triggers value changes. Acceps a comparison function as a second argument.

| Argument | Type | Desc |
|---|:---|:---|
| Callback | `Function` | Getter function or atomic function |
| Comparator | `Function` | Comparator function; accepts 2 arguments, new and old return value of the callback function. Will trigger the dependencies and store the new value when Comparator returns `true` |

Returns the return value of the callback function

```js
const [number, setNumber] = atom(0)
reactive(() => {
  console.log(`number is ${guard(number)}`)
})

await setNumber(1) // triggers the reactive function and logs `count is 1`
await setNumber(1) // does not trigger the reactive function
await setNumber(2) // triggers the reactive function and logs `count is 2`
```

Example using custom comparator function:

```js
const [number, setNumber] = atom(0)
reactive(() => {
  console.log(`number is ${guard(number, (a, b) => parseInt(a) !== parseInt(b))}`)
})

await setNumber(0.5) // does not trigger the reactive function, because parseInt(0.5) is still 0
await setNumber(1.1) // triggers the reactive function and logs `count is 1.1`
await setNumber(1.5) // does not trigger the reactive function, because parseInt(1.5) is still 1
```

## Core

This part describes the core functionality that the framework is built upon. Majority of users should not interact with it directly unless working on a library that extends core functionalities.

### ReactiveVar

- [src/core.mjs#L110](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L110)
- Accept `Any`
- Return instance of [RectiveVar](#ReactiveVar)

> A class that is used by atoms internally to store value.

> **NOTE:** *it is recommended to use atoms in your work, unless you are working on a library or you like the syntax of it better. If you prefer to use `ReactiveVar` directly for OOP style programming, you still should use [new atom](#new-atom) instead*

```js
import { ReactiveVar } from "atomi"
```

#### #get

- [src/core.mjs#L116](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L116)

> Returns current value of the ReactiveVar and registers current scope as a dependency is current scope exists

```js
const counter = new atom(0)
reactive(() => {
  const count = counter.get()
  ...
})
```

#### #set

- [src/core.mjs#L123](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L123)

> Sets value of the ReactiveVar

```js
const counter = new atom(0)
counter.set(2) // counter.get will return 2 instead
```

### Scope

- [src/core.mjs#L41](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L41)
- Accept `Function`
- Return instance of [Scope](#Scope)

> A class that manages reactive functions

```js
import { Scope } from "atomi"
```

| Argument | Type | Desc |
|---|:---|:---|
| Callback | `Function` | The function that we with to execute when inside update |

> [reactive](#reactive) passes scope to the callback fucntion and returns the same scope

```js
const scope = reactive(scope => {
  console.log(scope.firstRun) // logs: true
})

scope.die()
```
#### #depend

- [src/core.mjs#L59](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L59)
- Return `void`

> Is used by [ReactiveVar.get](#get) to register a dependency

#### die

- [src/core.mjs#L91](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L91)
- Return `void`

> Intended to be used like [#stop](#stop) but permanently

#### #execute

- [src/core.mjs#L74](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L74)
- Return `void`

> Is used by [Tracker](#Tracker) when to execute reactive function when [Scope](#Scope) was triggered by any [ReactiveVars](#ReactiveVar) previously

#### #firstRun

- [src/core.mjs#L41](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L41)
- Return `Boolean`

> A getter property of Scope. Returns true if the dependant function has not been called more then once.

```js
reactive(scope => {
  console.log(scope.firstRun) // logs: true
})
```

#### #resume

- [src/core.mjs#L69](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L69)
- Return `void`

> Is used to restore connection between dependant [ReactiveVars](#ReactiveVars) and the [Scope](#Scope). Should be called to restore reactive function execution after [Scope.stop](#stop) had been called.

```js
const [count, setCount] = atom(0)
const scope = reactive(scope => {
  console.log(`count is ${count()}`)
})
await setCount(1) // logs `count is 1`
scope.stop()
await setCount(2) // does not log anything
scope.resume()
await setCount(3) // logs `count is 3`
```

#### #stop

- [src/core.mjs#L64](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L64)
- Return `void`

> Is used when we want to temporary suspend reactive function execution event when its dependencies are updated.

```js
const [count, setCount] = atom(0)
const scope = reactive(scope => {
  console.log(`count is ${count()}`)
})
await setCount(1) // logs `count is 1`
scope.stop()
await setCount(2) // does not log anything
scope.resume()
await setCount(3) // logs `count is 3`
```

#### #trigger

- [src/core.mjs#L101](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L101)
- Return `Promise`

> Is used by [ReactiveVar](#ReactiveVar) when setting a new value.

Returns `Promise` that fullfils when reactive function of the scope is finished executing

#### #triggeredBy

- [src/core.mjs#L48](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L48)
- Type `Set`

> Is a property of the scope. Is usefull when debugging to know what [ReactiveVar](#ReactiveVar) triggered the scope update when scope depends on multiple ReactiveVars

### Tracker

- [src/core.mjs#L2](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L2)
- Type `Object`

> Intended to be used as a global object to track and register ReactiveVar updates and execute reactive functions

```js
import { Tracker } from "atomi"
```

#### scheduleJob

- [src/core.mjs#L5](https://github.com/tymnim/atomi/blob/master/src/core.mjs#L5)
- Accept [scope](#Scope)
- Return `Promise`

> Schedules scope's reactive function to execute when callback queue is empty. Is used by [Scope.trigger](#trigger) to schedule function execution when dependant [ReactiveVars](#ReactiveVar) update.

## Usefull functions

This sections will focus exclusively on the functions to enhance experience with using [atoms](#atoms) Specifically on the (callback setter)[#callback-setter) part of it. All of the following functions shine when used in combination with the callback setter

### Numbers

#### add

- [src/numbers.mjs#L2](https://github.com/tymnim/atomi/blob/master/src/numbers.mjs#L2)
- Accept `Number`
- Return `(Number) => Number`

> Creates and adder function

```js
import { add } from "atomi"
```

```js
const [count,, setCount] = atom(0)

setCount(add(2)) // sets 2 as count value
setCount(add(5)) // sets 7 as count value
```

#### sub

- [src/numbers.mjs#L6](https://github.com/tymnim/atomi/blob/master/src/numbers.mjs#L6)
- Accept `Number`
- Return `(Number) => Number`

> Creates and subtractor function

```js
import { sub } from "atomi"
```

```js
const [count,, setCount] = atom(10)

setCount(sub(2)) // sets 8 as count value
setCount(sub(5)) // sets 3 as count value
```

#### inc

- [src/numbers.mjs#L10](https://github.com/tymnim/atomi/blob/master/src/numbers.mjs#L10)
- Accept `(Number) => Number`
- Return `Number`

> Is an edge case of [add](#add) function that uses 1 as its argument

```js
import { inc } from "atomi"
```

```js
const [count,, setCount] = atom(0)

setCount(inc) // sets 1 as count value
setCount(inc) // sets 2 as count value
```

#### dec

- [src/numbers.mjs#L11](https://github.com/tymnim/atomi/blob/master/src/numbers.mjs#L11)
- Accept `(Number) => Number`
- Return `Number`

> Is an edge case of [sub](#sub) function that uses 1 as its argument

```js
import { sub } from "atomi"
```

```js
const [count,, setCount] = atom(10)

setCount(sub) // sets 9 as count value
setCount(sub) // sets 8 as count value
```

#### power

- [src/numbers.mjs#L13](https://github.com/tymnim/atomi/blob/master/src/numbers.mjs#L13)
- Accept `Number`
- Return `(Number) => Number`

> Creates power function

```js
import { pow } from "atomi"
```

```js
const [count,, setCount] = atom(2)

setCount(pow(2)) // sets 4 as count value
setCount(pow(3)) // sets 64 as count value
```

### Objects

#### assign


- [src/objects.mjs#L2](https://github.com/tymnim/atomi/blob/master/src/objects.mjs#L2)
- Accept `Object`
- Return `(Object) => Object`

> Creates assigner function

```js
import { assign } from "atomi"
```

```js
const [person,, setPerson] = atom({ name: "tim" })

setPerson(assing({ age: 22 })) // sets person to be { name: "tim", age: 22 }
setPerson(assing({ age: 23 })) // sets person to be { name: "tim", age: 23 }
```

### Booleans

#### not

- [src/booleans.mjs#L2](https://github.com/tymnim/atomi/blob/master/src/booleans.mjs#L2)
- Accept `Any`
- Return `Boolean`

> Should be self explanatory

```js
import { not } from "atomi"
```

```js
const [state,, setState] = atom(true)

setState(not) // sets state to false
setState(not) // sets state to true
```

#### id

- [src/booleans.mjs#L6](https://github.com/tymnim/atomi/blob/master/src/booleans.mjs#L6)
- Accept `Any`
- Return `Any`

> Good old identity function

```js
import { id } from "atomi"
```

```js
const [array,, setArray] = atom([1,0,2,0])

setArray(filter(id)) // filters out all falsy values leaving [1, 2]
```

#### is

- [src/booleans.mjs#L10](https://github.com/tymnim/atomi/blob/master/src/booleans.mjs#L10)
- Accept `Any`
- Return `(Any) => Boolean`

> Good old identity function

```js
import { is } from "atomi"
```

```js
const [array,, setArray] = atom([1,0,1,2,0])

setArray(filter(is(1))) // filters out all values that are not 1 leaving [1, 1]
```

#### lesser

- [src/booleans.mjs#L14](https://github.com/tymnim/atomi/blob/master/src/booleans.mjs#L14)
- Accept `Number`
- Return `(Number) => Boolean`

> Creates function that check if value is lesser then provided

```js
import { lesser } from "atomi"
```

```js
const [array,, setArray] = atom([1,0,1,2,0])

setArray(filter(lesser(2))) // filters all values that less then 2 [1,0,1,0]
```

#### greater

- [src/booleans.mjs#L18](https://github.com/tymnim/atomi/blob/master/src/booleans.mjs#L18)
- Accept `Number`
- Return `(Number) => Boolean`

> Creates function that check if value is lesser then provided

```js
import { greater } from "atomi"
```

```js
const [array,, setArray] = atom([1,0,1,2,0])

setArray(filter(greater(1))) // filters all values that are greater then 1 leaving [2]
```

#### negative

- [src/booleans.mjs#L22](https://github.com/tymnim/atomi/blob/master/src/booleans.mjs#L22)
- Accept `Number`
- Return `Boolean`

> Is an edge case of [lesser](#lesser) function that uses 1 as its argument

```js
import { negative } from "atomi"
```

```js
const [array,, setArray] = atom([-1,0,1,2,0])

setArray(filter(negative)) // filters out all values that are not negative leaving [-1]
```

#### positive

- [src/booleans.mjs#L23](https://github.com/tymnim/atomi/blob/master/src/booleans.mjs#L23)
- Accept `Number`
- Return `Boolean`

> Is an edge case of [greater](#greater) function that uses 1 as its argument

```js
import { positive } from "atomi"
```

```js
const [array,, setArray] = atom([-1,0,1,2,0])

setArray(filter(positive)) // filters out all values that are not negative leaving [1,2]
```

### Arrays

#### map

- [src/arrays.mjs#L2](https://github.com/tymnim/atomi/blob/master/src/arrays.mjs#L2)
- Accept `(Any) => Any`
- Return `(Any) => Any`

> Creates a mapper

```js
import { map } from "atomi"
```

```js
const [array,, setArray] = atom([1,3,2])

setArray(map(x => x + 1)) // increases all array elements by 1
setArray(map(inc)) // increases all array elements by 1 using inc
```

#### filter

- [src/arrays.mjs#L6](https://github.com/tymnim/atomi/blob/master/src/arrays.mjs#L6)
- Accept `(Any) => Any`
- Return `(Any) => Any`

> Creates a filterer

```js
import { filter } from "atomi"
```

```js
const [array,, setArray] = atom([1,3,2])

setArray(filter(x => x > 1)) // keeps only elemens that are larger then 1
```

#### prepend

- [src/arrays.mjs#L10](https://github.com/tymnim/atomi/blob/master/src/arrays.mjs#L10)
- Accept `Any`
- Return `(Array) => Array`

> Creates a prepender

```js
import { prepend } from "atomi"
```

```js
const [array,, setArray] = atom([1,3,2])

setArray(prepend(0, 0.5)) // adds 0 and 0.5 at the beginning. Not array is [0,0.5,1,3,2]
```

#### append

- [src/arrays.mjs#L14](https://github.com/tymnim/atomi/blob/master/src/arrays.mjs#L14)
- Accept ...`Any`
- Return `(Array) => Array`

> Creates a appender

```js
import { append } from "atomi"
```

```js
const [array,, setArray] = atom([1,3,2])

setArray(append(0)) // add 0 at the end. Not array is [1,3,2,0]
```

#### insert

- [src/arrays.mjs#L18](https://github.com/tymnim/atomi/blob/master/src/arrays.mjs#L18)
- Accept `Number`, ...`Any`
- Return `(Array) => Array`

> Creates a inserter

```js
import { insert } from "atomi"
```

```js
const [array,, setArray] = atom([1,3,2])

setArray(insert(1, 4, 5)) // inserted [4, 5] at position 1. Now array stores [1, 4, 5, 3, 2]
```

#### assignWhere

- [src/arrays.mjs#L26](https://github.com/tymnim/atomi/blob/master/src/arrays.mjs#L26)
- Accept `(Any) => Boolean`, `Any => Any`
- Return `(Array, NONE) => Array`

> Creates a function that will update specific element in the array

```js
import { assignWhere } from "atomi"
```

```js
const [array,, setArray] = atom([1,3,2])

setArray(assignWhere(is(3)), inc) // where element is equal to 3 it will increases it by 1. Now array stores [1,4,2]
```

#### sort

- [src/arrays.mjs#L37](https://github.com/tymnim/atomi/blob/master/src/arrays.mjs#L37)
- Accept `(Any, Any) => Boolean`
- Return `(Array) => Array`

> Creates a function that will sort an array based on the sorter provided when passed to a [callback setter](#callback-setter)

```js
import { sort } from "atomi"
```

```js
const [array,, setArray] = atom([11,1,3,2])

setArray(sort()) // using default js sorter. Now array stores [1, 11, 2, 3]
```

#### asc

- [src/arrays.mjs#L44](https://github.com/tymnim/atomi/blob/master/src/arrays.mjs#L44)
- Accept `Any`, `Any`
- Return `Boolean`

> Precoded sorter to sort by ascending order

```js
import { asc } from "atomi"
```

```js
const [array,, setArray] = atom([11,1,3,2])

setArray(sort(asc)) // using default js sorter. Now array stores [1, 2, 3, 11]
```

#### desc

- [src/arrays.mjs#L48](https://github.com/tymnim/atomi/blob/master/src/arrays.mjs#L48)
- Accept `(Any, Any) => Boolean`
- Return `(Array) => Array`

> Precoded sorter to sort by descending order

```js
import { desc } from "atomi"
```

```js
const [array,, setArray] = atom([11,1,3,2])

setArray(sort(desc)) // using default js sorter. Now array stores [11, 3, 2, 1]
```
