// Global variable used to cache the currentError on screen. Used
// in main.js - hidePageComponents() to clear the error upon moving to new screen.
let $currentError;

/**
 * Utility function that takes a jQuery object and an error, generates an
 * errorComponent from the error and then prepends it to the jQuery object.
 */
function prependError($element, error) {
  // If an error already exists, remove it
  if ($currentError) {
    $currentError.remove();
  }

  const $error = generateErrorComponent(error.message);
  $currentError = $error;
  $element.prepend($error)
}

/**
 * All individual componets show the same alert-error and just use a different
 * message. Generates the jQuery object for them to display in their own component.
 */

function generateErrorComponent(message) {
  return $(`
    <div class="alert-error">
    <i class="fas fa-exclamation-circle"></i>${message}
    </div>
  `)
}

/**
 * Removes currentError from the screen and resets it back to undefined.
 */
function removeCurrentError() {
    $currentError.remove();
    $currentError = undefined;
}