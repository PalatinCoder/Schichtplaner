/**
 * Utilities
 */

const TAG = "[util]"

let _trigger;
/**
 * Intercept all events triggered by jQuery
 * 
 * @param request string start|stop
 */
export const eventTrap = (request = 'start') => {
    if (request = 'start') {
        _trigger = jQuery.event.trigger;
        jQuery.event.trigger = function(e,t,n,r) {
            if (typeof(e) == "string") console.log(`[event trap] ${e}`);
            _trigger(e,t,n,r);
        }
        console.log(TAG, 'event trap enabled');
        
    } else {
        jQuery.event.trigger = _trigger;
        console.log(TAG, 'event trap disabled');
    }
}

/**
 * Add hours to a date
 * @param h How many hours
 * @returns Date
 */
Date.prototype.addHours = function(h) { this.setTime(this.getTime() + (h*60*60*1000)); return this; };

/**
 * Get the calendar week of a date
 * @returns numeric
 */
Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

/**
 * Group a array. Group key must be provided by callback
 * @param groupCallback function(element) Receives the current element and must return the group key
 * @param options object options.inital: initial value for the reduce
 * @returns array
 */
Array.prototype.group = function(groupCallback, options = { initial: {} }) {
    return this.reduce((acc, cur) => {
        acc[groupCallback(cur)] = [...acc[groupCallback(cur)] || [], cur];
        return acc;
    }, options.initial)
};

/**
 * Event handler for onsubmit of forms 
 * @param event DOMEvent (submit)
 */
export const validateForm = (event) => {
    console.log(TAG, "validate form");
    event.target.classList.remove('needs-validation');
    event.target.classList.add('was-validated');

    /* Don't acutally submit the form */
    event.preventDefault();
    event.stopPropagation();

    /* But create a FormData Object to trigger the formdata event */
    if (event.target.checkValidity()) new FormData(event.target);
};

/**
 * Sleep a little while
 * 
 * @param duration duration in miliseconds
 * @returns Promise
 */
export const sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration));