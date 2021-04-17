import {settings} from '../settings.js';

class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }
  
  get value() {
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value) {
    const thisWidget = this;
   
    const newValue = thisWidget.parseValue(value);

    thisWidget.correctValue = settings.amountWidget.defaultValue;

    if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      //if (thisWidget.correctValue > settings.amountWidget.defaultMin || thisWidget.correctValue < settings.amountWidget.defaultMax)
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
    thisWidget.dom.input.value = thisWidget.correctValue;

    /*
    if (thisWidget.correctValue > settings.amountWidget.defaultMax) {
      thisWidget.dom.input.value = parseInt(10);
      thisWidget.correctValue = parseInt(10);
    } else if (thisWidget.correctValue < settings.amountWidget.defaultMin) {
      thisWidget.dom.input.value = parseInt(0);
      thisWidget.correctValue = parseInt(0);
    } else {
      thisWidget.dom.input.value = thisWidget.correctValue;
    }
    thisWidget.announce();
    */
  }
 
  //NEW METHOD 11.1
  parseValue(value) {
    return parseInt(value);
  }

  //NEW METHOD 11.1
  isValid(value) {
    return !isNaN(value);
  }

  //NEW METHOD 11.1
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  //NEW METHOD 11.1
  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
  }

  announce() {
    const thisWidget = this;

    /* NEW 9.5.8 */
    //const event = new Event('update');
    const event = new CustomEvent('update', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
    //console.log('HALLLLOOO !!!');

  }
}

export default BaseWidget;