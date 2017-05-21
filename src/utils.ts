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