import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;
    
    thisCart.products = [];
    thisCart.totalPrice = 0;
    thisCart.getElements(element);
    thisCart.initActions();
  }
  
  getElements(element) {
    const thisCart = this;
    
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); //DO TEST !!!
    thisCart.dom.productList = document.querySelector(select.cart.productList);
    /* NEW 9.7 */
    thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = document.querySelector(select.cart.totalPrice);
    thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    thisCart.dom.total = document.querySelector(select.cart.total);
    /* NEW 9.9 xxx */
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.address = document.querySelector(select.cart.address);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
  }
  
  /* NEW METHOD 9.8 */
  remove(product) {
    const thisCart = this;

    //console.log(product);
    /* delete HTML of product */
    /* find index of removing product from cart */ 
    const indexOfProduct = thisCart.products.indexOf(product);
    //console.log(indexOfProduct);
    /* delete HTML of product */
    //console.log('html', thisCart.dom.productList.querySelector(`ul.cart__order-summary>li:nth-of-type(${indexOfProduct+1})`));
    const productToDeleteHTML = thisCart.dom.productList.querySelector(`ul.cart__order-summary>li:nth-of-type(${indexOfProduct+1})`);
    productToDeleteHTML.remove();

    /* delete information about curent product from table thisCart.products */
    //console.log('this product', product);
    //console.log('table cart product', thisCart.products);
    thisCart.products.splice(indexOfProduct, indexOfProduct + 1);
    //console.log('table cart product AFTER REMOVE', thisCart.products);
    //numbers update
    thisCart.update();
  }

  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    /* NEW 9.8 */
    thisCart.dom.productList.addEventListener('update', function() {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event) {
      thisCart.remove(event.detail.cartProduct);
    });
    /* NEW 9.9 xxx */
    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  /* NEW METHOD 9.4 */
  //adding product (menuPrduct) to Cart
  add(menuProduct) {
    const thisCart = this;

    //INFO: menuProduct (84line) to handlebar do kodu HTML danego produktu (np. pizza - tytul, obrazek, opcje, przyciski..)

    //console.log('Adding product: ', menuProduct); 

    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    //INFO: generatedHTML to tekst podobny do HTML zamówienia, który jest wyswietlany w koszyku
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //INFO: generatedDOM to HTML zamówienia, który jest wyswietlany w koszyku

    /* add element to menu */
    thisCart.dom.productList.appendChild(generatedDOM);

    /* NEW 9.5 */
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //INFO: thisCart.products podobny do menuProduct ale zawiera wiecej informacji (np amountWidget i DOM)

    /* 9.6 to chyba zrobione na wyrost --->>. */
    //thisCart.dom.totalPrice = document.querySelector(select.cart.totalPrice); ok

    /* total price of whole cart */
    thisCart.totalPrice += Number(menuProduct.price);

    //thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
    /* <<<----------------- */
    
    /* NEW METHOD 9.6  */
    thisCart.update();
  }
  /* NEW METHOD 9.6  */
  update() {
    const thisCart = this;

    let deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;
    for (let cartProduct of thisCart.products) {
      totalNumber += Number(cartProduct.amount);
      subtotalPrice += Number(cartProduct.price);   
    }
    thisCart.dom.deliveryFee.innerHTML = 0;

    if (!(totalNumber > 0)) {
      deliveryFee = 0;
      thisCart.totalPrice = 0;
    }
    thisCart.totalPrice = subtotalPrice + deliveryFee;

    thisCart.dom.deliveryFee.innerHTML = deliveryFee;

    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;

    thisCart.dom.totalPrice.innerHTML = Number(thisCart.totalPrice);
    thisCart.dom.totalNumber.innerHTML = totalNumber;

    thisCart.dom.total.innerHTML = Number(thisCart.totalPrice);     
  }
  /* NEW METHOD 9.9 xxx */
  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;
    
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice, 
      subtotalPrice: 'xx1', //set thisCart.subtotalPrice...
      totalNumber: 'xx2',  //set thisCart.totalNumber...
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}

export default Cart;