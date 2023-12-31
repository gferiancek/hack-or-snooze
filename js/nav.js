'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug('navAllStories', evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on('click', '#nav-all', navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug('navLoginClick', evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on('click', navLoginClick);

/** Show New Story submit form on click of "submit" */

function navSubmitClick(evt) {
  console.debug('navSubmitClick', evt);
  // If allStories is hidden, show it first before sliding down submitFrom.
  if ($allStoriesList.is(':hidden')) {
    hidePageComponents();
    $allStoriesList.show();
  }
  $submitForm.slideDown().show();
}

$navSubmit.on('click', navSubmitClick);

/** Show ownStoriesList on click of "my stories" */

function navOwnStoriesClick(evt) {
  console.debug('navOwnStoriesClick', evt);

  hidePageComponents();
  putOwnStoriesOnPage();
}

$navOwnStories.on('click', navOwnStoriesClick);

/** Show favStoriesList on click of 'favorites' */

function navFavoritesClick(evt) {
  console.debug('navFavoritesClick', evt);

  hidePageComponents();
  putFavoriteStoriesOnPage();
}

$navFavorites.on('click', navFavoritesClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug('updateNavOnLogin');
  $('.main-nav-links').show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
