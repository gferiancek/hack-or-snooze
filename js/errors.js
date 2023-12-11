// Global variable used to cache the currentError on screen. Used
// in main.js - hidePageComponents() to clear the error upon moving to new screen.
let $currentError;

/**
 * Utility function that takes a jQuery object and an error, generates an
 * errorComponent from the error and then prepends it to the jQuery object.
 *  - $element - jQuery Object to append the Error to.
 *  - error - Error that occured during Axios API Call.
 */
function prependError($element, error) {
  // If an error already exists, remove it
  if ($currentError) {
    $currentError.remove();
  }

  const $error = generateErrorComponent(error.message);
  $currentError = $error;
  $error.hide();
  $element.prepend($error);
  $error.slideDown().show();
}

/**
 * Utility function to create an alert-error jQuery Object.
 *  - message - Message to be displayed inside the alert.
 *
 * Returns jQuery object of class alert-error.
 */

function generateErrorComponent(message) {
  return $(`
    <div class="alert-error">
    <i class="fas fa-exclamation-circle"></i>${message}
    </div>
  `);
}

/**
 * Removes currentError from the screen and resets it back to undefined.
 */
function removeCurrentError() {
  $currentError.remove();
  $currentError = undefined;
}
