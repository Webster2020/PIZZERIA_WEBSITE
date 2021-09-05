import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;
    
    thisCart.products = [];
    //thisCart.totalPrice = 0;
    thisCart.getElements(element);
    thisCart.initActions();
  }
  
  getElements(element) {
    const thisCart = this;
    
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = document.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice); //change
    thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    //thisCart.dom.total = document.querySelector(select.cart.total);
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.address = document.querySelector(select.cart.address);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
  }
  
  remove(product) {
    const thisCart = this;

    const indexOfProduct = thisCart.products.indexOf(product);
    const productToDeleteHTML = thisCart.dom.productList.querySelector(`ul.cart__order-summary>li:nth-of-type(${indexOfProduct+1})`);

    productToDeleteHTML.remove();
    thisCart.products.splice(indexOfProduct, indexOfProduct + 1);
    thisCart.update();
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('update', function() {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //thisCart.totalPrice += Number(menuProduct.price);
    thisCart.update();
  }

  update() {
    const thisCart = this;
    console.log('update Cart');
    // let deliveryFee = settings.cart.defaultDeliveryFee;
    // let totalNumber = 0;
    // let subtotalPrice = 0;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for (let product of thisCart.products) {
      // totalNumber += Number(cartProduct.amount);
      // subtotalPrice += Number(cartProduct.price);  
      this.totalNumber += product.amount;
      this.subtotalPrice += product.price;
    }
    //thisCart.dom.deliveryFee.innerHTML = 0;
    
    // if (!(totalNumber > 0)) {
    //   deliveryFee = 0;
    //   thisCart.totalPrice = 0;
    // }
    if (thisCart.totalNumber !== 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    }
    else {
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 0;
    }
    // thisCart.totalPrice = subtotalPrice + deliveryFee;    
    // thisCart.dom.deliveryFee.innerHTML = deliveryFee;    
    // thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;   
    // thisCart.dom.totalPrice.innerHTML = Number(thisCart.totalPrice);
    // thisCart.dom.totalNumber.innerHTML = totalNumber;    
    // thisCart.dom.total.innerHTML = Number(thisCart.totalPrice);   
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    for (let price of thisCart.dom.totalPrice) {
      price.innerHTML = thisCart.totalPrice;
    }
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;
    
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice, 
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
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