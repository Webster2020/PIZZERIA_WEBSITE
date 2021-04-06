/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
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
        //input: 'input[name="amount"]',
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      total: '.cart__order-total .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
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
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      
      //console.log('new Product data: ', thisProduct.data); //tu jest to wypisane 
    }

    renderInMenu() {
      const thisProduct = this;
      /* generate HTML based on template */
      const generateHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */

      /* << IMPORTANT >> adding new properity calls "element" to instance of Product; it is a part of HTML code inside tag "articel" */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
      /* NEW PROPERITY 9.3 */
      /*
      thisProduct.dom = {
        accordionTrigger: thisProduct.element.querySelector(select.menuProduct.clickable),
        form: thisProduct.element.querySelector(select.menuProduct.form),
        formInputs: thisProduct.form.querySelectorAll(select.all.formInputs),
        cartButton: thisProduct.element.querySelector(select.menuProduct.cartButton),
        priceElem: thisProduct.element.querySelector(select.menuProduct.priceElem),
        imageWrapper: thisProduct.element.querySelector(select.menuProduct.imageWrapper),
        amountWidgetElem: thisProduct.element.querySelector(select.menuProduct.amountWidget),
      };
      /* ----- */
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      /* NEW PROPS 9.1 */
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
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
        const activeProduct = document.querySelector('.product.active'); //classNames.menuProduct.wrapperActive
        //console.log('PRODUCT ACTIVE : ', activeProduct);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct !== null && activeProduct !== thisProduct.element) {
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
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
    
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      /* TO DELETE LATER */
      //console.log('\n----NOWY OBIEKT-----\n\n', thisProduct.id, '\n\nformData', formData); //wszystko co jest w obiektach "params" w wartosciach kluczy w pliku data.js przedstawione w "fajny" sposob dzieki funckji utils.serial..... z pliku functions.js
    
      // set price to default price
      let price = thisProduct.data.price; //wszystko co jest w obiektach "price" w wartosciach kluczy w pliku data.js
      /* TO DELETE LATER */
      //console.log('priceOfProduct: ', thisProduct.data.price);
      // for every category (param)...
      for(let paramId in thisProduct.data.params) { //petla po parametrach (kategoriach)
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        /* TO DELETE LATER */
        //console.log('params: ', paramId, '\nwartosc klucza params: ', param);
    
        // for every option in this category
        for(let optionId in param.options) { //schodzimy jeden level glebiej w drzewie do opcji kazdego parametru
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId]; 
          
          //console.log('params -> option (nazwa kolejnej podtablicy - nazwa klucza): ', optionId, '\nwartosci klucza opcji: ', option); 

          //console.log('-----------------------------------\nformData[paramId]: ', formData[paramId], '\n----------------------------------');
          
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if(optionImage) {
            //console.log('IMAGE FOUND! : ', optionImage);
            if(formData[paramId] && formData[paramId].includes(optionId)) {
              //console.log('SPRAWDZAM CZY IMAGE FOUND');
              // check if the option is default
              if(!optionId) {
                //console.log('IMAGE == FALSE');
                // remove class activ (visibility)
                optionImage.classList.remove(classNames.menuProduct.imageVisible); 
              } else {
                //console.log('IMAGE == TRUE');
                // add class activ (visibility)
                optionImage.classList.add(classNames.menuProduct.imageVisible);             
              }
            } else { 
              // check if the option is not default
              if(optionId) {
                //console.log('IMAGE == FALSE');
                // remove class activ (visibility)
                optionImage.classList.remove(classNames.menuProduct.imageVisible);
              }
            }
          }
          

          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)) {
            //console.log('SPRAWDZAM CZY TRUE');
            // check if the option is default
            if(!optionId) {
              //console.log('DEFAULT == FALSE');
            } else {
              //console.log('DEFAULT == TRUE');
              //console.log(option.price);              
              // reduce price variable
              price += option.price;
              //console.log('price after action: ', price);
            }
          } else { 
            // check if the option is not default
            if(optionId) {
              //console.log('DEFAULT == FALSE');
            }
          }
          //console.log('888888888888888888888888888888888888888888888888888888888888888888888888888888'); 
        }
      }
      /* priceSingle NEW 9.4 */
      thisProduct.priceSingle = price;

      /* multiply price bu amount NEW 9.1 */ 
      price *= thisProduct.amountWidget.value;
      //console.log('AmountWidgetValue:', thisProduct.amountWidget.value);
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }

    /* NEW METHOD 9.1 */
    initAmountWidget() {
      const thisProduct = this;
      /* cretaion new properity of instance of class Product */
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('update', function() {
        thisProduct.processOrder();
      });
    }

    /* NEW METHOD 9.4 */
    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct()); //maybe nawias? 
    }

    /* NEW METHOD 9.4 */
    prepareCartProductParams() {
      const thisProduct = this;
    
      const formData = utils.serializeFormToObject(thisProduct.form);

      const params = {};

      for(let paramId in thisProduct.data.params) {  
        const param = thisProduct.data.params[paramId];
        // console.log('param label: ', param.label);
        // console.log('paramID: ', paramId);
        // console.log('param: ',param);
        params[paramId] = {
          label: param.label,
          options: {},
        };
        // for every option in this category
        for(let optionId in param.options) { 

          const option = param.options[optionId]; 
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected) {
            // option is selected!
            // console.log('option label: ', option.label);
            // console.log('optionId: ',optionId);
            // console.log('option: ', option);
            params[paramId].options[optionId] = option.label;
          }  
        }
      }
      //console.log('P-A-R-A-M-S:', params);
      return params; 
    }

    /* NEW METHOD 9.4 */
    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary; //maybe nawias?
    }
  }

  /* NEW CLASS 9.1 */
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
      //console.log('setValue');
      const newValue = parseInt(value);

      thisWidget.value = settings.amountWidget.defaultValue;

      if (thisWidget.value !== newValue && !isNaN(newValue)) {
        //if (thisWidget.value > settings.amountWidget.defaultMin || thisWidget.value < settings.amountWidget.defaultMax)
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      if (thisWidget.value > settings.amountWidget.defaultMax) {
        thisWidget.input.value = parseInt(10);
      } else if (thisWidget.value < settings.amountWidget.defaultMin) {
        thisWidget.input.value = parseInt(0);
      } else {
        thisWidget.input.value = thisWidget.value;
      }
    }
    /* 9.5.3 TU COS TRZEBA POMYSLEC NAD TYM, ZE OMIJA JEDYNKE PRZY ZMIANIE SZTUK */
    initActions() {
      const thisWidget = this;
      // console.log('initActions');
      thisWidget.input.addEventListener('change', function(event) {
        console.log(event);
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(parseInt(thisWidget.input.value) - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
      });
    }

    announce() {
      const thisWidget = this;

      /* NEW 9.8 */
      //const event = new Event('update');
      const event = new CustomEvent('update', {
        buubles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  /* NEW CLASS 9.3 */
  class Cart {
    constructor(element) {
      const thisCart = this;
      
      thisCart.products = [];
      thisCart.totalPrice = 0;
      thisCart.getElements(element);
      thisCart.initActions();
      
      console.log('new Cart', thisCart);
      console.log('new Cart products[]', thisCart.products);
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
    }
    
    /* NEW METHOD 9.8 */
    remove(product) {
      const thisCart = this;

      console.log(product);
      /* delete HTML of product */
      /* find index of removing product from cart */ 
      const indexOfProduct = thisCart.products.indexOf(product);
      console.log(indexOfProduct);
      /* delete HTML of product */
      console.log('html', thisCart.dom.productList.querySelector(`ul.cart__order-summary>li:nth-of-type(${indexOfProduct+1})`));
      const productToDeleteHTML = thisCart.dom.productList.querySelector(`ul.cart__order-summary>li:nth-of-type(${indexOfProduct+1})`);
      productToDeleteHTML.remove();

      /* delete information about curent product from table thisCart.products */
      console.log('this product', product);
      console.log('table cart product', thisCart.products);
      thisCart.products.splice(indexOfProduct, indexOfProduct + 1);
      console.log('table cart product AFTER REMOVE', thisCart.products);
      //numbers update
      thisCart.update();
    }

    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(event) {
        console.log(event);
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); //DO TEST !!!
      });
      /* NEW 9.8 */
      thisCart.dom.productList.addEventListener('update', function() {
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event) {
        thisCart.remove(event.detail.cartProduct);
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
      //console.log('cartContainer:', cartContainer);  
      thisCart.dom.productList.appendChild(generatedDOM);

      /* NEW 9.5 */
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //console.log('thisCart.products', thisCart.products);
      //INFO: thisCart.products podobny do menuProduct ale zawiera wiecej informacji (np amountWidget i DOM)

      /* 9.6 to chyba zrobione na wyrost --->>. */
      //thisCart.dom.totalPrice = document.querySelector(select.cart.totalPrice); ok

      //console.log(thisCart.products.price);
      /* total price of whole cart */
      thisCart.totalPrice += Number(menuProduct.price);

      //thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      /* <<<----------------- */
      
      /* NEW METHOD 9.6  */
      thisCart.update();
    }
    /* NEW METHOD 9.6  */
    update() {
      console.log('UPDATE RUN!');
      const thisCart = this;
      console.log('cartProductDOm', thisCart.dom);
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
      for (let cartProduct of thisCart.products) {
        console.log('cartProduct in loop: ', cartProduct.price);
        totalNumber += Number(cartProduct.amount);
        subtotalPrice += Number(cartProduct.price);   
      }
      thisCart.dom.deliveryFee.innerHTML = 0;
      if (totalNumber > 0) {
        //thisCart.totalPrice += deliveryFee;
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
        thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
        console.log('subtotalPrice:', subtotalPrice);
        thisCart.dom.totalPrice.innerHTML = Number(thisCart.totalPrice + deliveryFee);
        thisCart.dom.totalNumber.innerHTML = totalNumber;
        console.log('totalNumber:', totalNumber);
        thisCart.dom.total.innerHTML = Number(thisCart.totalPrice + deliveryFee);
      }
    }
  }

  /* 9.5 COMMENT: Podsumowując, chcemy, aby klasa Cart zajmowała się całym koszykiem, jego głównymi funkcjonalnościami, a klasa CartProduct pojedynczymi produktami, które się w nim znajdują. */
  
  /* NEW CLASS 9.5 */
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      /* type this all props of menuProduct - how?? check all props of menuProduct in console */
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.amount = menuProduct.amount; //ATTENTION !! 9.5.3. !! -->>  to jest ilosc danego produktu dodawanego do koszyka

      thisCartProduct.price = menuProduct.price; //ATTENTION !! 9.5.3. !! -->>  to jest wartosc danego produktu dodawanego do koszyka

      //console.log('Wartosc produktu: ', thisCartProduct.price);

      thisCartProduct.priceSingle = menuProduct.priceSingle;   
      
      thisCartProduct.getElements(element); // do I need it?
      /* NEW METHOD 9.5.3 !!! */
      thisCartProduct.initAmountWidget();
      /* NEW METHOD 9.8 */
      thisCartProduct.initActions();
    }
    
    getElements(element) {
      const thisCartProduct = this;
      
      //console.log('thisCartProduct: ', thisCartProduct);
      
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
      console.log('remove click');
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
  }

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

    /* NEW METHOD 9.3 */
    initCart: function() {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
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
      /* NEW METHOD 9.3 */
      thisApp.initCart();
    },
  };
 
  app.init();
}
