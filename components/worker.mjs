import { workers } from "./store.mjs";
import { validateForm } from '../lib/util.mjs'

const TAG = "[worker]";

let $list, template, $detailsModal, $formModal

/**
 * Initialize the component
 */
const init = () => {
    $list = $('#workers table');
    $detailsModal = $('#workerWorkedShifts');
    $formModal = $('#formWorker');
    template = $list.find('template').get(0);

    $list.find('tbody').empty();

    $(document).on('store:changed', renderTable);
    $detailsModal.on('show.bs.modal', renderDetailModal);
    $formModal.on('show.bs.modal', renderFormModal);

    $formModal.find('form')
        .on('submit', validateForm)
        .on('formdata', function(event) { 
            event.preventDefault(); 
            $(document).trigger('worker:requestSave', event.originalEvent.formData);
            $formModal.modal('hide');
            $(this).removeClass('was-validated');
        });

    $list.on('click', 'button[data-action="delete"]', event => $(document).trigger('worker:requestDelete', $(event.currentTarget).data('id')));

    console.log(TAG, 'component loaded');
}
export default init 

/**
 * Render the table of all the workers
 * 
 * @param event (to be used as an event handler)
 */
const renderTable = event => {
    console.log(TAG, 'render table');

    $list.find('tbody').empty();

    workers.forEach((worker, id) => {
        let $row = $(document.importNode(template.content, true));

        $row.find('[data-model="id"]').text(id);
        $row.find('[data-model="name"]').text(worker.name);
        $row.find('[data-model="workedShifts"]').text(worker.workedShifts.length);
        $row.find('[data-entity]').each((counter, element) => $(element).attr('data-entity', `${worker}`))
        $row.find('button[data-id]').each((counter, element) => $(element).attr('data-id', id));

        $list.find('tbody').append($row);
    });
}

/**
 * Load the worker's details into the modal
 * @param event (to be used as an event handler on show.bs.modal)
 */
const renderDetailModal = event => {
    let sender = $(event.relatedTarget);
    let id = sender.data('id');

    console.log(TAG, `render modal for ${id}`);

    $detailsModal.find('.modal-title .name').text(workers[id].name);
    $detailsModal.find('.modal-body .list-group').html(
        workers[id].workedShifts.reduce((acc, cur) => `${acc}<li class="list-group-item">${cur.toString()}</li>`, '')
    )
};

/**
 * Render the form to edit/create a worker
 * @param event (to be used as an event handler on show.bs.modal)
 */
const renderFormModal = event => {
    let sender = $(event.relatedTarget);
    let id = sender.data('id');
    let isCreate = isNaN(id);

    console.log(TAG, `render form for ${isCreate ? 'create' : id}`);

    $formModal.find('input[name="name"]').val(isCreate ? '' : workers[id].name);
    $formModal.find('input[name="id"]').val(isCreate ? 'new' : id);
}

/**
 * Data model
 */
export class worker {
    constructor(name, unavailableTimes = [], preferredTimes = []) {
        this.name = name;
        this.workedShifts = [];
        this.unavailableTimes = unavailableTimes;
        this.preferredTimes = preferredTimes;
    }

    getDispatchingPriority(shift) { 
        let prio = 1;
        let isPreferredTime = this.preferredTimes.some((t) => t.start < shift.start && t.end > shift.end);

        prio += this.workedShifts.length;
        let factorForPreferredTime = isPreferredTime ? 0.5 : 1;
        prio *= factorForPreferredTime;

        return prio;
    }

    isAvailableFor(shift) {
        let hasTime = this.unavailableTimes.every((t) => t.end < shift.start || t.start > shift.end);
        let isAlreadyDispatchedForShift = this.workedShifts.indexOf(shift) >= 0;
        return hasTime && !isAlreadyDispatchedForShift;
    }

    toString() { return this.name; }
};