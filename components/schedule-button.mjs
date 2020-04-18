const TAG = "[schedule-button]";

let $this;

/**
 * Initialize the component
 */
const init = () => {
    $this = $('#scheduleButton');

    // enable the button when there are changes
    $(document).on('store:changed', () => { console.log(TAG, 'enabling'); $this.prop('disabled', false)});
    // disable the button until there are some changes again
    $(document).on('schedule:finished', () => { console.log(TAG, 'disabling'); $this.prop('disabled', true)});

    $this.on('click', () => $(document).trigger('schedule:request'));

    console.log(TAG, 'component loaded');
}
export default init;