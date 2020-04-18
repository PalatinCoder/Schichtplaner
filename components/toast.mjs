/**
 * Component: Toast
 * 
 * Show notifications for certain events
 */

const TAG = "[toast]";

var $this;

/**
 * Setup the component
 */
const init = () => {
    $this = $('.toast')

    $this.toast().on('show.bs.toast', () => console.log(TAG, 'show'));

    $(document).on('schedule:finished', (event, result) =>{
        let msg = result.successful ? 'Plan vollständig generiert' : `Plan unvollständig, es fehlen <strong>${result.missing}</strong> Schichten`;
        let severity = result.successful ? 'success': 'warning'
        show(msg, severity);
    })

    console.log(TAG, 'component loaded');
}

let types = {
    success: {
        text: 'Erfolgreich',
        icon: 'check'
    },
    warning: {
        text: 'Warnung',
        icon: 'exclamation'
    },
    info: {
        text: 'Information',
        icon: 'info'
    }
}

/**
 * Show a toast
 *  
 * @param message message, shown in the body
 * @param type severity, header will be set accordingly
 */
const show = (message, type) => {
    if (!types.hasOwnProperty(type)) type = 'info'

    $this.find('.toast-header')
        .removeClass('text-success text-warning')
        .addClass(`toast-header text-${type}`)

    $this.find('.toast-header strong').text(types[type].text)

    $this.find('i')
        .removeClass('fa-warning-circle fa-success-circle')
        .addClass(`fa-${types[type].icon}-circle`)

    $this.find('.toast-body')
        .html(message)

    $this.toast('show');
}

export default init