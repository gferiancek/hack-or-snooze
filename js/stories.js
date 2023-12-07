'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

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
