import {templates} from '../settings.js';
import utils from '../utils.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.element = element;
    console.log(thisBooking.element);
    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    console.log('render');

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

  }

  initWidgets() {
    const thisBooking = this;

    console.log('initWidget');
  }

}

export default Booking;