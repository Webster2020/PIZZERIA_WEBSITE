import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
  
    // set price to default price
    let price = thisProduct.data.price; //wszystko co jest w obiektach "price" w wartosciach kluczy w pliku data.js

    for(let paramId in thisProduct.data.params) { //petla po parametrach (kategoriach)
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

  
      // for every option in this category
      for(let optionId in param.options) { //schodzimy jeden level glebiej w drzewie do opcji kazdego parametru
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId]; 
  
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        if(optionImage) {
          if(formData[paramId] && formData[paramId].includes(optionId)) {
            // check if the option is default
            if(!optionId) {
              // remove class activ (visibility)
              optionImage.classList.remove(classNames.menuProduct.imageVisible); 
            } else {
              // add class activ (visibility)
              optionImage.classList.add(classNames.menuProduct.imageVisible);             
            }
          } else { 
            // check if the option is not default
            if(optionId) {
              // remove class activ (visibility)
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
        
        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          // check if the option is default
          if(optionId) {     
            // reduce price variable
            price += option.price;
          }
        } 
      }
    }
    /* priceSingle NEW 9.4 */
    thisProduct.priceSingle = price;
    
    /* multiply price bu amount NEW 9.1 */
    if (thisProduct.amountWidget.value > 10) {
      thisProduct.amountWidget.value = 10;
    } 
    price *= thisProduct.amountWidget.value;

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

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  /* NEW METHOD 9.4 */
  prepareCartProductParams() {
    const thisProduct = this;
  
    const formData = utils.serializeFormToObject(thisProduct.form);

    const params = {};

    for(let paramId in thisProduct.data.params) {  
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {},
      };
      // for every option in this category
      for(let optionId in param.options) { 

        const option = param.options[optionId]; 
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(optionSelected) {
          params[paramId].options[optionId] = option.label;
        }  
      }
    }
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
    return productSummary;
  }
}

export default Product;