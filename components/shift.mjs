import { shifts } from "./store.mjs";
import { validateForm } from "../lib/util.mjs";

const TAG = "[shift]";

let $workersModal, $formModal

/**
 * Initialize the component
 */
const init = () => {
    $workersModal = $('#shiftWorkers');
    $formModal = $('#formShift');

    $workersModal.on('show.bs.modal', renderDetailModel);
    $formModal.on('show.bs.modal', renderFormModal);
    $formModal.find('select#shiftCopy').on('change', copyShift);

    $formModal.find('form')
        .on('submit', validateForm)
        .on('formdata', function(event) {
            event.preventDefault();
            $(document).trigger('shift:requestSave', event.originalEvent.formData);
            $formModal.modal('hide');
            $(this).removeClass('was-validated');
        });

    console.log(TAG, 'component loaded');
}
export default init

/**
 * Load the shift's workers into the modal
 * @param event to be used as an event handler
 */
const renderDetailModel = event => {
    let sender = $(event.relatedTarget);
    let id = sender.data('id');

    console.log(TAG, `render modal for ${id}`);

    $workersModal.find('.modal-body .list-group').html(
        shifts[id].workers.reduce((acc, cur) => `${acc}<li class="list-group-item">${cur.toString()}</li>`, '')
    )
}

/**
 * Render the form to edit/create a shift
 * @param event used as an event handler
 */
const renderFormModal = event => {
    let sender = $(event.relatedTarget);
    let id = sender.data('id');
    let isCreate = isNaN(id);

    console.log(TAG, `render form for ${isCreate ? 'create' : id}`);

    $formModal.find('input[name="id"]').val(isCreate ? 'new' : id);
    $formModal.find('input[name="date"]').val(isCreate ? undefined : shifts[id].start.toISOString().slice(0,10));
    $formModal.find('input[name="time"]').val(isCreate ? undefined : shifts[id].start.toTimeString().slice(0,5));
    $formModal.find('input[name="duration"]').val(isCreate ? 0.5 : shifts[id].duration);
    $formModal.find('input[name="neededWorkers"]').val(isCreate ? 1 : shifts[id].neededWorkers);

    $formModal.find('select#shiftCopy').html(
        shifts.reduce((acc, cur, idx) => `${acc}<option value="${idx}">${cur.toString()}</li>`, '<option>Auswählen</option>')
    )
}

/**
 * Copy the selected shift to the form
 * @param event to be used as an event handler
 */
const copyShift = event => {
    let index = event.target.selectedOptions[0].value;
    if (!isNaN(index)) {
        let form = $('#formShift form');
        let template = shifts[index];
        form.find('#shiftDuration').val(template.duration);
        form.find('#shiftNeededWorkers').val(template.neededWorkers);
        form.find('#shiftStartDate').val(template.start.toISOString().slice(0,10));
        form.find('#shiftStartTime').val(template.start.toLocaleTimeString()).slice(0,5);
    }
}


/**
 * Data model
 */
export class shift {
    constructor(start, duration, workers) {
        this.start = start;
        this.end = new Date(this.start).addHours(duration);
        this._duration = duration;
        this.neededWorkers = workers;
        this.workers = [];
    }
    get duration() {
        return this._duration;
    }

    set duration(value) {
        this._duration = value;
        this.end = new Date(this.start).addHours(value);
    }

    get timeslotHash() {
        return `${this.start.toLocaleTimeString()} - ${this.end.toLocaleTimeString()}`
    }

    toString() {
        return `${this.start.toLocaleString()} - ${this.end.toLocaleTimeString()}`;
    }
}