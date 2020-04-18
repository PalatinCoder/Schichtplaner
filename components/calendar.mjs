import { shifts } from "./store.mjs";

const TAG = "[calendar]";

let $this, template;

/**
 * Initialize the component
 */
const init = () => {
    $this = $('.cal-root');
    template = $('template#calEvent');

    $(document).on('store:changed', render);


    console.log(TAG, 'component loaded');
}
export default init;

/**
 * Render a weekly calendar view
 * //TODO filter by calendar week
 */
const render = () => {
    console.log(TAG, 'render');

    let hours = getHourBounds(shifts);
    let scale = calculateScale(shifts);
    let shiftsByDay = shifts.groupBy(s => (s.start.getDay()+6)%7, { initial: [ [],[],[],[],[],[],[] ] });
    
    $this.empty();
    let $hourScale = $(document.createElement('div'))
        .addClass('col-1')
        .addClass('cal-weekday')
        .css({ height: hours.length * scale})
        .append(hours.map(
            (h,i) => $(document.createElement('span')).addClass('cal-event').css({height: scale, top: i * scale}).text(`${h}:00`)
        ))

    let $shifts = $(document.createDocumentFragment()).append(
    shiftsByDay.reduce((days, day) => `${days}
        <div class="col cal-weekday">
            ${day.reduce((shifts, shift) => `${shifts}
            <div class="cal-event card ${shift.workers.length != shift.neededWorkers ? 'border-warning' : ''}" style="height: ${shift.duration * scale}px; top: ${(shift.start.getHours() + shift.start.getMinutes()/60 - hours[0])*scale}px">
                    <div class="card-body py-1">
                        <span class="card-title">${shift.start.toLocaleString()}</span>
                    </div>
                    <ul class="list-group list-group-flush">
                        ${shift.workers.reduce((workers, worker) => `${workers}
                        <li class="list-group-item py-1">${worker.name}</li>
                        `,'')}
                    </ul>
                </div>
            `,'')}
        </div>
    `, ''));
    
    $this.append($hourScale, $shifts);
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