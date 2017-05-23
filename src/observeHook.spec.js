import { expect } from 'chai';
import { Observable } from 'rxjs/Observable';
import { spy } from 'sinon';

import { ObserveHook } from './observeHook';

describe('ObserveHook', () => {
  it('should create the hook fn', () => {
    class MyClass {
      @ObserveHook('destroy') destroyed;
    }  

    const myClass = new MyClass();

    expect(myClass.destroy).to.be.a('function');
  });

  it('should create an observable', () => {
    class MyClass {
      @ObserveHook('destroy') destroyed;
    }  

    const myClass = new MyClass();

    expect(myClass.destroyed).to.be.an.instanceOf(Observable);
  });

  it('should emit when the hook is invoked', () => {
    const _spy = spy();

    class MyClass {
      @ObserveHook('destroy') destroyed;
    }  

    const myClass = new MyClass();

    myClass.destroyed.subscribe(_spy);
    myClass.destroy();

    expect(_spy.called).to.be.true;
  });

  it('should complete when the hook is invoked', () => {
    const _spy = spy();

    class MyClass {
      destroy;

      @ObserveHook('destroy') destroyed;
    }  

    const myClass = new MyClass();

    myClass.destroyed.subscribe({ complete: _spy });
    myClass.destroy();

    expect(_spy.called).to.be.true;
  });

  it('should complete when the complete hook is invoked', () => {
    const _spy = spy();
    const _complete = spy();

    class MyClass {
      @ObserveHook('destroy', { completeOn: 'complete' }) destroyed;
    }  

    const myClass = new MyClass();

    myClass.destroyed.subscribe({ next: _spy, complete: _complete });
    myClass.destroy();

    expect(_spy.called).to.be.true;
    expect(_complete.called).to.be.false;

    myClass.complete();

    expect(_complete.called).to.be.true;
  });

  it('should cache the value', () => {
    const _spy = spy();

    class MyClass {
      @ObserveHook('destroy', { cache: true, initValue: 'blorg' }) 
      destroyed;

      destroy(text) {}
    }  

    const myClass = new MyClass();

    myClass.destroyed.subscribe(_spy);

    expect(_spy.called).to.be.true;
    expect(_spy.getCall(0).args[0]).to.equal('blorg');

    myClass.destroy('test');

    expect(_spy.getCall(1).args[0]).to.equal('test');
  });
});