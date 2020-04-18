/**
 * Component: Plan title
 * 
 * Shown on the navbar and as heading when printing the plan
 */

const TAG = "[title]";

var $input, $output;

const init = () => {
    $input = $('#navbar input');
    $output = $('main h2')

    // set initially
    $output.text($input.val())

    $input
        .on('dblclick change', event => { $input.toggleClass('border').toggleClass('border-white').attr('readonly', (i,a) => !a) })
        .on('change', event => { $output.text($input.val())})

    console.log(TAG, 'component loaded');
}

export default init