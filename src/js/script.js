/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

//const { utils } = require("stylelint");

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  const app = {
    initData: function() {
      const thisApp = this;
      thisApp.data = dataSource;
    },
    initMenu: function() {
      const thisApp = this;
      //console.log('testData: ', thisApp.data);
      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]); // (key, value of key)
      }
    },
    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data; //wszystko co jest wartoscia kluczy w pliku data.js
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
      
      console.log('new Product data: ', thisProduct.data); //tu jest to wypisane 
    }
    renderInMenu() {
      const thisProduct = this;
      /* generate HTML based on template */
      const generateHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }
    initAccordion() {
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      /*
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      */
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */     
        const activeProduct = thisProduct.element.querySelector(classNames.menuProduct.wrapperActive);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);            
      });
    }
    initOrderForm() {
      const thisProduct = this;
      //console.log(thisProduct.initOrderForm);
      
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        console.log('1');
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
          console.log('2');
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        console.log('3');
      });
    }
    processOrder() {
      const thisProduct = this;
    
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      /* TO DELETE LATER */
      console.log('\n----NOWY OBIEKT-----\n\n', thisProduct.id, '\n\nformData', formData); //wszystko co jest w obiektach "params" w wartosciach kluczy w pliku data.js przedstawione w "fajny" sposob dzieki funckji utils.serial..... z pliku functions.js
    
      // set price to default price
      let price = thisProduct.data.price; //wszystko co jest w obiektach "price" w wartosciach kluczy w pliku data.js
      /* TO DELETE LATER */
      console.log('price: ', thisProduct.data.price);
      // for every category (param)...
      for(let paramId in thisProduct.data.params) { //petla po parametrach (kategoriach)
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        /* TO DELETE LATER */
        console.log('params: ', paramId, '\nwartosc klucza params: ', param);
    
        // for every option in this category
        for(let optionId in param.options) { //schodzimy jeden level glebiej w drzwie do opcji kazdego parametru
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId]; 
          
          console.log('params -> option (nazwa kolejnej podtablicy - nazwa klucza): ', optionId, '\nwartosci klucza opcji: ', option); 

          //UWAGA!!!!!
          //musze wejsc do option tak jak powyzej do param!!!!
          //UWAGA!!!!!

          console.log('-----------------------------------\nformData[paramId]: ', formData[paramId], '\n----------------------------------');
          
          
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)) {
            console.log("SPRAWDZAM CZY TRUE");
            // check if the option is default
            if(!optionId) {
              console.log('DEFAULT == FALSE');
            } else {
              console.log('DEFAULT == TRUE');
              console.log(option.price);              
              // reduce price variable
              price += option.price;
              console.log('price after action: ', price);
            }
          } else { 
            // check if the option is not default
            if(optionId) {
              console.log('DEFAULT == FALSE');
            }
          }
          console.log('888888888888888888888888888888888888888888888888888888888888888888888888888888'); 
        }
      }
    
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
  }
  app.init();
}
