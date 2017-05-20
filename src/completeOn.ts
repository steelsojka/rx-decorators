import { isFunction, isCompleteable } from './utils';

/**
 * Completes an observable when the provided method is invoked or when the provided Observable emits a value.
 * @export
 * @param {(string | Observable<any>)} method 
 * @returns {PropertyDecorator} 
 * @example
 * class MyClass {
 *   @CompleteOn('$onDestroy') clicks = new Subject();
 * }
 */
export function CompleteOn(method: string): PropertyDecorator {
  return (target: any, name: string) => {
    const descriptor = Object.getOwnPropertyDescriptor(target, method) || {};
    const { value } = descriptor;

    Object.defineProperty(target, method, {
      ...descriptor,
      value(this: any, ...args: any[]): any {
        const returnVal = isFunction(value) ? value.apply(this, args) : undefined;

        if (isCompleteable(this[name])) {
          this[name].complete();
        }

        return returnVal;
      }
    });
  }
}