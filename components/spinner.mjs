const TAG = "[spinner]";

let $this;

const init = () => {
    $this = $('#spinner');

    $(document).on('schedule:request', () => $this.modal('show'));
    $(document).on('schedule:finished', () => $this.modal('hide'));

    console.log(TAG, 'component loaded');
}
export default init;
