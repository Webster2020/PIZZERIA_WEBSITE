import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    //console.log('<<--NEW AMOUNT WIDGET-->>');
    console.log('AmountWidget: ', thisWidget);
    console.log('constructor argument: ', element); 
    //element = thisProduct.amountWidgetElem (from initAmountWidget)
    thisWidget.getElements(element);

    //thisWidget.setValue(thisWidget.dom.input.value); BASEWIDGET
    thisWidget.initActions();
  }

  //removing 'element' from argument
  getElements() {
    const thisWidget = this;

    //thisWidget.dom.wrapper = element; BASEWIDGET
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  
  //NEW METHOD 11.1
  isValid(value) {
    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin
    && value <= settings.amountWidget.defaultMax;
  }

  //NEW METHOD 11.1
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  /* 9.5.3 TU COS TRZEBA POMYSLEC NAD TYM, ZE OMIJA JEDYNKE PRZY ZMIANIE SZTUK */
  initActions() {
    const thisWidget = this;
    // console.log('initActions');
    thisWidget.dom.input.addEventListener('change', function(event) {
      console.log(event);
      thisWidget.value = thisWidget.dom.input.value;
      //console.log(thisWidget.dom.input.value);
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) - 1);
      //console.log(thisWidget.dom.input.value);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) + 1);
      //console.log(thisWidget.dom.input.value);
    });
  }

}

export default AmountWidget;