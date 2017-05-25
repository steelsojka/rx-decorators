import { isFunction, isCompleteable, getDescriptor } from './utils';

/**
 * Completes an observable when the provided method is invoked or when the provided Observable emits a value.
 * @export
 * @param {string} method  The name of the hook to complete the subject on.
 * @returns {PropertyDecorator} 
 * @example
 * class MyClass {
 *   @CompleteOn('$onDestroy') clicks = new Subject();
 * }
 */
export function CompleteOn(method: string): PropertyDecorator {
  return (target: any, name: string) => {
    const descriptor = getDescriptor(target, method) || {};
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