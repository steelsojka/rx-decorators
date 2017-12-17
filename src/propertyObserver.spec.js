import { expect } from 'chai';
import { spy } from 'sinon';
import { Observable } from 'rxjs/Observable';

import { PropertyObserver, ObservedProperty } from './propertyObserver';

describe('PropertyObserver', () => {
  class Test {
    @ObservedProperty()
    readOnly;

    @PropertyObserver({
      prop: 'readOnly',
      value: false,
      completeOn: 'destroy'
    })
    readOnly$;

    destroy() {}
  }

  it('should create an observable for the decorated property', () => {
    const test = new Test();

    expect(test.readOnly$).to.be.an.instanceOf(Observable);
    test.destroy();
  });

  it('should create getter with the value', () => {
    const test = new Test();

    expect(test.readOnly).to.be.false;

    test.readOnly = true;

    expect(test.readOnly).to.be.true;
  });

  describe('when the property is set', () => {
    it('should emit on the observable', () => {
      const test = new Test();
      const _spy = spy();

      test.readOnly$.subscribe(_spy);
      test.readOnly = true;
      test.destroy();
      expect(_spy.getCall(0).args[0]).to.be.false;
      expect(_spy.getCall(1).args[0]).to.be.true;
    });
  });

  describe('when the completed hook is invoked', () => {
    it('should complete the observable', () => {
      const test = new Test();
      const _spy = spy();

      test.readOnly$.subscribe({
        complete: _spy
      });

      test.destroy();
      expect(_spy.callCount).to.equal(1);
    });
  });
});