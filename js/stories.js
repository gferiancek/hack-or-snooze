'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/****************************************************************************
 * Rendering stories to the $allStoryList
 */

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug('putStoriesOnPage');

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**************************************************************************
 * Generating jQuery Objects for a given story object.
 */

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const starIcon = currentUser ? getFavoriteIcon(currentUser, story) : '';
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${starIcon}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets the proper star icon to match whether or not the story is favorited */
function getFavoriteIcon(user, story) {
  const starType = user.isFavorite(story) ? 'fas' : 'far';
  return `<i class="${starType} fa-star"></i>`;
}

/************************************************************************************
 * Creating and Rendering user created Stories.
 */

/** Grabs form data from $submitForm, creates new story, and displays API Response. */

async function onSubmitStory(evt) {
  evt.preventDefault();

  const author = $('#author-name').val();
  const title = $('#story-title').val();
  const url = $('#story-url').val();

  const response = await storyList.addStory(currentUser, {
    author,
    title,
    url,
  });

  if (response.error) {
    prependError($submitForm, response.error);
  }

  if (response.data) {
    // Create and prepend jQuery Story object.
    const $story = generateStoryMarkup(response.data);
    $allStoriesList.prepend($story);

    // Reset form and slide off screen.
    $submitForm.trigger('reset');
    $submitForm.slideUp(function () {
      $(this).hide();
    });
  }
}

$submitForm.on('submit', onSubmitStory);

/** Get list of own stories from currentUser, generates their HTML, and puts on page. */

function putOwnStoriesOnPage() {
  $ownStoriesList.empty();

  // Loop through own stories and generate HTML for them.
  console.log(currentUser, currentUser.ownStories);
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $ownStoriesList.append($story);
  }

  $ownStoriesList.slideUp().show();
}

/**************************************************************************************
 * Updating and displaying User Favorites
 */

/** */
async function toggleFavorite(evt) {
  // Grabs storyId from parent <li> and finds corresponding story.
  const storyId = evt.target.closest('li').id;
  const story = storyList.stories.find((story) => story.storyId === storyId);

  let response;

  // Call add / removeFavorite based on favorite status of story.
  if (currentUser.isFavorite(story)) {
    response = await currentUser.removeFavorite(story);
  } else {
    response = await currentUser.addFavorite(story);
  }

  if (response.error) {
    prependError($storiesContainer, response.error);
  }

  // On success, we can just replace the current icon with a newly generated one
  // to avoid adding / removing classes from existing icon.
  if (response.data) {
    $(evt.target).replaceWith(getFavoriteIcon(currentUser, story));
  }
}

$allStoriesList.on('click', '.fa-star', toggleFavorite);
