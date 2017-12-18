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

  describe('when using multiple decorators', () => {
    class Test {
      @ObservedProperty('blorg')
      prop1;

      @PropertyObserver({
        prop: 'blorg',
        valueFactory: () => ({})
      })
      prop1$;

      @ObservedProperty()
      prop2;

      @PropertyObserver({ prop: 'prop2', value: 'test' })
      prop2$;
    }

    it('should emit correctly', () => {
      const spy1 = spy();
      const spy2 = spy();

      const test = new Test();

      expect(test.prop1).to.eql({});
      expect(test.prop2).to.eql('test');

      test.prop1$.subscribe(spy1);
      test.prop2$.subscribe(spy2);

      test.prop1 = [];
      test.prop2 = 'bam';

      expect(test.prop1).to.eql([]);
      expect(test.prop2).to.eql('bam');
      expect(spy1.callCount).to.equal(2);
      expect(spy2.callCount).to.equal(2);
      expect(spy1.getCall(0).args[0]).to.eql({});
      expect(spy1.getCall(1).args[0]).to.eql([]);
      expect(spy2.getCall(0).args[0]).to.eql('test');
      expect(spy2.getCall(1).args[0]).to.eql('bam');
    });
  });
});