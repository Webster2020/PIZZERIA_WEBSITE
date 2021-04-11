import {settings, select} from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    //console.log('<<--NEW AMOUNT WIDGET-->>');
    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor argument: ', element); 
    //element = thisProduct.amountWidgetElem (from initAmountWidget)
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }
  /* 9.5.3 TU COS TRZEBA POMYSLEC NAD TYM, ZE OMIJA JEDYNKE PRZY ZMIANIE SZTUK */
  setValue(value) {
    const thisWidget = this;
    console.log('setValue');
    const newValue = parseInt(value);

    thisWidget.value = settings.amountWidget.defaultValue;

    if (thisWidget.value !== newValue && !isNaN(newValue)) {
      //if (thisWidget.value > settings.amountWidget.defaultMin || thisWidget.value < settings.amountWidget.defaultMax)
      thisWidget.value = newValue;
      
    }
    if (thisWidget.value > settings.amountWidget.defaultMax) {
      thisWidget.input.value = parseInt(10);
      thisWidget.value = parseInt(10);
    } else if (thisWidget.value < settings.amountWidget.defaultMin) {
      thisWidget.input.value = parseInt(0);
      thisWidget.value = parseInt(0);
    } else {
      thisWidget.input.value = thisWidget.value;
    }
    thisWidget.announce();
  }
  /* 9.5.3 TU COS TRZEBA POMYSLEC NAD TYM, ZE OMIJA JEDYNKE PRZY ZMIANIE SZTUK */
  initActions() {
    const thisWidget = this;
    // console.log('initActions');
    thisWidget.input.addEventListener('change', function(event) {
      console.log(event);
      thisWidget.setValue(thisWidget.input.value);
      //console.log(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.input.value) - 1);
      //console.log(thisWidget.input.value);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
      //console.log(thisWidget.input.value);
    });
  }

  announce() {
    const thisWidget = this;

    /* NEW 9.5.8 */
    //const event = new Event('update');
    const event = new CustomEvent('update', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;