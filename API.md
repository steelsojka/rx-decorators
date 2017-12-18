<a name="CompleteOn"></a>

## CompleteOn(method) ⇒ <code>PropertyDecorator</code>
Completes an observable when the provided method is invoked or when the provided Observable emits a value.

**Kind**: global function
**Export**:

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The name of the hook to complete the subject on. |

**Example**
```js
class MyClass {
  @CompleteOn('$onDestroy') clicks = new Subject();
}
```

<a name="ObserveHook"></a>

## ObserveHook(method, options) ⇒ <code>PropertyDecorator</code>
Observes a hook method a emits the first argument given to it. If the `completeOn` method is not provided then the observable will emit and then complete.

**Kind**: global function
**Export**:

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The name of the hook to observe.
| options | <code>{ completeOn?: string }</code> | Options
| options.completeOn | <code>string</code> | Optional hook to complete the observable on.

**Example**
```js
class MyClass {
  @ObserveHook('$onDestroy') destroyed: Observable<void>;
}

const myClass = new MyClass();

myClass.destroyed.subscribe(() => console.log('destroyed!!!'));
myClass.$onDestroy();

// DESTROYED!!!!
```

<a name="ObserverHandler"></a>

## ObserverHandler(observer) ⇒ <code>PropertyDecorator</code>
Creates a method that emits on the given observable name. The first argument is emitted. This is primarily useful when needing to create a method that just emits on a specific Subject.

**Kind**: global function
**Export**:

| Param | Type | Description |
| --- | --- | --- |
| observer | <code>string</code> | The name of the observer.

**Example**
```typescript
class MyClass {
  @ObserverHandler('subject') emit: (value: string) => void;

  subject = new Subject();
}

const myClass = new MyClass();

myClass.subject.subscribe(v => console.log(v)); // => 'test'
myClass.emit('test');
```

<a name="PropertyObserver"></a>

## PropertyObserver(config) ⇒ <code>PropertyDecorator</code>
 * Creates an Observable that mirrors another properties values. This is used in conjunction with
 * `ObservedProperty`.

**Kind**: global function
**Export**:

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The configuration.
| config.prop | <code>string</code> | The property to mirror. Note, the property must be annotated with `ObservedProperty`.
| config.value? | <code>any</code> | The initial value of the property.
| config.valueFactory? | <code>any</code> | A factory that generates the initial value. Useful for complex objects.
| config.completeOn? | <code>string</code> | The name of a function to complete on when executed.

**Example**
```typescript
class Test {
  @ObservedProperty()
  isValid: boolean;

  @PropertyObserver({ prop: 'isValid', value: false })
  isValid$: Observable<boolean>;
}

const test = new Test();

test.isValid$.subscribe(v => console.log(v)); // false, true
test.isValid = true;

console.log(test.isValid); // true
```