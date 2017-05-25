import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

export function isFunction(val: any): val is Function {
  return typeof val === 'function';
}

export function isObject<T extends Object>(val: any): val is T {
  return typeof val === 'object' && val !== null;
}

export function isString(val: any): val is string {
  return typeof val === 'string';
}

export function isCompleteable<T>(val: any): val is Observer<T> {
  return isObject<Observer<T>>(val) && isFunction(val.complete);
}

export function isObserver<T>(val: any): val is Observer<T> {
  return isObject<Observer<T>>(val) && isFunction(val.next);
}

export function isObservable<T>(val: any): val is Observable<T> {
  return isObject<Observable<T>>(val) && isFunction(val.subscribe);
}

export const identity = <T>(t: T): T => t;

export function createUID(): () => number {
  let nextId = 0;

  return () => nextId++;
}

export function reducePrototype<T>(obj: any, reducer: (r: T, proto: object) => T, initial: T): T {
  let next = obj;
  let result: T = initial;

  while (isObject(next) && next !== Object.prototype) {
    result = reducer(result, next);
    next = Object.getPrototypeOf(next);
  }

  return result;
}

export function getDescriptor(obj: object, key: string): PropertyDescriptor | null {
  return reducePrototype(obj, (result: PropertyDescriptor | null, proto: object) => {
    return result ? result : Object.getOwnPropertyDescriptor(proto, key);
  }, null)
}