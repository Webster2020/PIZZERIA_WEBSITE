import {settings, select, templates, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';
//import BaseWidget from './BaseWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    // NEW 11.3
    thisBooking.table = '';
    thisBooking.tableSelected = '';
    //thisBooking.element = element;
    //console.log(thisBooking.element);
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponse) {
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      //20 minuta filmu 
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        console.log(bookings);
        // console.log(urls.eventsCurrent);
        // console.log(eventsCurrent);
        // console.log(urls.eventsRepeat);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    //console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    thisBooking.duration = duration;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined'
        ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);      
      }
    }
  }

  render(element) {
    const thisBooking = this;

    //console.log('render');

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    //console.log(thisBooking.dom.tables);

    thisBooking.dom.submit = document.querySelector(select.booking.submit);
    //console.log(thisBooking.dom.submit);

    thisBooking.dom.phone = document.querySelector(select.booking.phone);
    //console.log(thisBooking.dom.phone);

    thisBooking.dom.address = document.querySelector(select.booking.address);
    //console.log(thisBooking.dom.address);
    
    thisBooking.dom.starterWater = document.querySelector(select.booking.starterWater);
    //console.log(thisBooking.dom.starterWater.checked);
    
    thisBooking.dom.starterBread = document.querySelector(select.booking.starterBread);
    //console.log(thisBooking.dom.starterBread.checked);

  //   thisBooking.dom.starters = document.querySelectorAll(select.booking.starters);
  //   console.log(thisBooking.dom.starters);
  // }
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('update', function() {
      
      thisBooking.updateDOM();

      //console.log('BEFORE thisBooking.tableSelected', typeof thisBooking.tableSelected);
      //console.log('BEFORE thisBooking.table', thisBooking.table);

      if (thisBooking.tableSelected != '') {
        thisBooking.tableSelected.classList.remove('selected');
        thisBooking.tableSelected = '';
        thisBooking.table = '';
      } else {
        //console.log('nothing selected');
      }

      //console.log('AFTER thisBooking.tableSelected', typeof thisBooking.tableSelected);
      //console.log('AFTER thisBooking.table', thisBooking.table);

      
    });

    //NEW 11.3
    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function() {
        //console.log(table);
        thisBooking.initTable(table);
      });
    }
    //11.3
    
    thisBooking.dom.submit.addEventListener('click', function(event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  //NEW METHOD 11.3
  initTable(table) {
    const thisBooking = this;

    for (let tab of thisBooking.dom.tables) {
      if (tab.classList.contains('selected')) {
        thisBooking.tableSelected = tab;
      }
    }
    //1. check is this table free
    if (table.classList.contains('booked')) {
      //2. alert with table is reserved
      alert('This table is reserved! Choose another one please.');
    } else {
      //3. if is free add number of table to thisBooking.table
      thisBooking.table = table.getAttribute('data-table');
      if (!thisBooking.tableSelected) {
        //5. add to table class .selected to clicked table
        table.classList.toggle('selected');
        thisBooking.tableSelected = table;
        //console.log(thisBooking.tableSelected, thisBooking.table);
      } else {
        // 4. if any table has class .selected then remove it
        thisBooking.tableSelected.classList.remove('selected');
        thisBooking.tableSelected = '';
        //5. add to table class .selected to clicked table
        table.classList.toggle('selected');
        thisBooking.tableSelected = table;
        //console.log(thisBooking.tableSelected, thisBooking.table);
      }
    }
    //console.log(thisBooking.table);
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    
    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hourPicker.value,
      table: Number(thisBooking.table), 
      duration: thisBooking.hoursAmount.correctValue,
      ppl: thisBooking.peopleAmount.correctValue,
      starters: [thisBooking.dom.starterWater.checked ? 'water' : '', thisBooking.dom.starterBread.checked ? 'bread' : ''],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
 
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

    console.log(payload);

    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);

    console.log(thisBooking.booked);
  }

}

export default Booking;