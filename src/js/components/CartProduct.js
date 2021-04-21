import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
  
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.amount = menuProduct.amount; 

    thisCartProduct.price = menuProduct.price; 

    thisCartProduct.priceSingle = menuProduct.priceSingle;   
    
    thisCartProduct.getElements(element); // do I need it?
    /* NEW METHOD 9.5.3 !!! */
    thisCartProduct.initAmountWidget();
    /* NEW METHOD 9.5.8 */
    thisCartProduct.initActions();
  }
  
  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  /* NEW METHOD 9.5.3 !!! */
  initAmountWidget() {
    const thisCartProduct = this;
    /* cretaion new properity of instance of class Product */
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget); // 9.5.3 SOMEWHERE THERE IS AVAILABLE AMOUNT VALUE ??
    thisCartProduct.dom.amountWidget.addEventListener('update', function() {
      /* UPDATE COST OF AMOUNT OF PRODUCT */
      thisCartProduct.amount = thisCartProduct.dom.amountWidget.querySelector('input').value;
      thisCartProduct.price = Number(thisCartProduct.amount) * Number(thisCartProduct.priceSingle);
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  /* NEW METHOD 9.8 */
  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  /* NEW METHOD 9.8 */
  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }

  /* NEW METHOD 9.9 xxxx */
  getData() {
    const thisCartProduct = this;

    const productSummary = {
      id: thisCartProduct.id,
      name: thisCartProduct.name,
      amount: thisCartProduct.amount,
      priceSingle: thisCartProduct.priceSingle,
      price: thisCartProduct.priceSingle * thisCartProduct.amount,
      params: thisCartProduct.params,
    };
    return productSummary; 
  }
}

export default CartProduct;