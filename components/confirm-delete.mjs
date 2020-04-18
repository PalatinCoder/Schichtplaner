/**
 * Component: Confirmation dialog for deleting entities
 */

const TAG = "[delete]";

let $this;

const init = () => {
    $this = $('#confirmDelete');

    $this.on('show.bs.modal', render);
    $this.find('.btn-danger').on('click', confirm)

    console.log(TAG, 'component loaded');
}
export default init;

const confirm = event => {
    console.log(TAG, 'confirmed');
    $(document).trigger('delete:confirmed');
}

const render = event => {
    let sender = $(event.relatedTarget);
    let entity = sender.data('entity');

    if (!entity) throw new Error(`${TAG} no entity given`)

    console.log(TAG, `render for ${entity}`);
    
    $this.find('[data-model="entity"').text(entity);
}