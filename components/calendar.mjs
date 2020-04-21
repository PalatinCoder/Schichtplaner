import { shifts } from "./store.mjs";

const TAG = "[calendar]";

const byDay = s => (s.start.getDay()+6)%7;
const byWeek = w => s => s.start.getWeek() == w
const newEmptyWeek = () => [ [],[],[],[],[],[],[] ]; // create a new array of seven arrays, for seven days in a week

/**
 * Init Alpine.js component with its properties and an update function
 */
export function component() {
    console.log(TAG, 'component loaded');
    return {
        _shifts: shifts,
        get currentShifts() { return this._shifts.filter(byWeek(this.currentWeek)) },
        get groupedShifts() { return this.currentShifts.group(byDay, { initial: newEmptyWeek() })},
        get hours() { return getHourBounds(this.currentShifts) },
        get scale() { return calculateScale(this.currentShifts) },
        get weeks() { return Object.keys(shifts.group(s => s.start.getWeek())) },
        currentWeek: 0,
    }
}

/**
 * Calculate the scaling factor based on the duration of the shifts to be displayed.
 * The smalles unit will be 100px high.
 * 
 * If, for example, no shift is shorter than one hour, then one hour will be 100px in height.
 * If there is a shift of 30min, 30min will be 100px and, accordingly, one hour will be 200px.
 * 
 * @param shifts Array of shifts to be displayed
 * @returns numeric
 */
const calculateScale = shifts => 100 / shifts.reduce((min,s) => Math.min(min, s.duration), 24);

/**
 * Determine the range of hours to be displayed, based on the earliest shift's start
 * and the latest shift's end
 * 
// TODO: cross midnight breaks this
 * 
 * @param shifts Array of shifts to be displayed
 * @returns array[numeric]
 */
const getHourBounds = (shifts) => {
    let lower = shifts.reduce((min, s) => Math.min(min, s.start.getHours()), 24);
    let upper = shifts.reduce((max, s) => Math.max(max, s.end.getHours()+1), 0);
    return Array.from({length: upper-lower}, (x,i) => i+lower);
};