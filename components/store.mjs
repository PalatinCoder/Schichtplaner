/**
 * Data store
 */
import { worker } from "./worker.mjs";
import { shift } from "./shift.mjs";
import { sleep } from "../lib/util.mjs";
import { schedule } from "../lib/scheduler.mjs";

const TAG = "[store]";

export var workers = [ new worker('Hans') ];
export var shifts = [ new shift(new Date(), 1, 2) ];

/**
 * Init callback
 * Wire up all the event handlers
 */
const init = () => {
    console.log(TAG, 'component loaded');

    // trigger change event to init the view after all modules are loaded
    $(document).on('main:loaded', () => $(document).trigger('store:changed'))

    // fire stage 2 of a delete when the confirmation comes in
    $(document).on('delete:confirmed', stage2Delete);

    $(document).on('worker:requestSave', saveWorker);
    $(document).on('worker:requestDelete', deleteWorker);

    $(document).on('shift:requestSave', saveShift);
    $(document).on('shift:requestDelete', deleteShift);

    $(document).on('schedule:request', () => reschedule());

}
export default init

/**
 * recalculate the plan
 */
const reschedule = async () => {
    // reset everything
    shifts.every(shift => shift.workers = []);
    workers.every(worker => worker.workedShifts = []);
    
    await sleep(500);

    // TODO: as schedule:finished comes before store:changed, scheduleButton enables itself immediatley after recalculating
    schedule(shifts, workers)
        .then(() => $(document).trigger('schedule:finished', { successful: true}))
        .catch((r) => $(document).trigger('schedule:finished', { successful: false, missing: r}))
        .finally(() => $(document).trigger('store:changed'))
}

/**
 * Will hold any pending delete operation,
 * waiting to be confirmed
 * (stage 2)
 */
let pendingDeleteOperation;

/**
 * Execute stage 2 delete
 * @param event 
 */
const stage2Delete = event => {
    console.log(TAG, 'processing delete operation');
    pendingDeleteOperation.call();
    $(document).trigger('store:changed');
}

/**
 * Process a save request for a worker 
 * @param event 
 * @param data FormData Object 
 */
const saveWorker = (event, data) => {
    let id = data.get('id');
    let isCreate = isNaN(id);
    console.log(TAG, `saving ${isCreate ? `new worker` : `worker ${id}`}`)

    if (isCreate) {
        workers.push(new worker(data.get('name')));
    } else {
        workers[id].name = data.get('name');
    }

    $(document).trigger('store:changed')
}

/**
 * Prepare the delete operation for the worker requested
 * (stage 1)
 * 
 * @param event (to be used as event handler on worker:requestDelete)
 * @param id id to be deleted
 * @returns function
 */
const deleteWorker = (event, id) => pendingDeleteOperation = () => workers.splice(id, 1);

/**
 * Process a save request for a shift 
 * @param event 
 * @param data FormData Object 
 */
const saveShift = (event, data) => {
    let id = data.get('id')
    let isCreate = isNaN(id);

    let s = new shift(new Date(`${data.get('date')} ${data.get('time')}`), data.get('duration'), data.get('neededWorkers'))

    if (isCreate) {
        shifts.push(s);
    } else {
        shifts[id] = s
    }

    //$(document).trigger('store:changed');
    document.dispatchEvent(new Event('store:changed'))
}

/**
 * Prepare the delete operation for the shift requested
 * (stage 1)
 * 
 * @param event (to be used as event handler on shift:requestDelete)
 * @param id id to be deleted
 * @returns function
 */
const deleteShift = (event, id) => pendingDeleteOperation = () => shifts.splice(id, 1);
