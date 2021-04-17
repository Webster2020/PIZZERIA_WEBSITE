'use strict';
//import settings object from setting.js file, ./ means that import is from current folder
import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {

  initPages: function() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    //new 11.4
    for (let page of thisApp.pages) {
      if (page.id == 'home') {
        page.classList.add(classNames.pages.active);
        window.location.hash = '/' + page.id;
        //pageMatchingHash = page.id;
        break;
      }
    }

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;
    //console.log(pageMatchingHash); 
    
    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(idFromHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');
        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id; // slash make, that page doesn't scroll after click
      });
    }
  },

  activatePage: function(pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      // if (page.id == pageId) {
      //   page.classList.add(classNames.pages.active);
      // } else {
      //   page.classList.remove(classNames.pages.active);
      // }
      //this and 5 lines above makes the same 
      page.classList.toggle(classNames.pages.active, page.id == pageId);
      //console.log(page);
    }
    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
      //console.log(link);
    }
  },

  initData: function() {
    const thisApp = this;

    thisApp.data = {}; 
    const url = settings.db.url + '/' + settings.db.product;
      
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        //console.log('parsedResponse', parsedResponse);
         
        // save parseResponse as thisApp.data.products 
        thisApp.data.products = parsedResponse;
        // execute initMenu method
        thisApp.initMenu();
      });      
  },

  initMenu: function() {
    const thisApp = this;
    for(let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]); 
    }
  },

  initCart: function() {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },
  // NEW METHOD 10.5
  initBooking: function() {
    const thisApp = this;

    thisApp.bookingContainer = document.querySelector(select.containerOf.booking);
    //console.log(thisApp.bookingContainer);
    //console.log('xx', select.containerOf.booking);
    //console.log('yy', thisApp.bookingContainer);
    thisApp.booking = new Booking(thisApp.bookingContainer);
  }, 

  init: function(){
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
  },
};
 
app.init();
