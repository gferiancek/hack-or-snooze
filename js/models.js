'use strict';

const BASE_URL = 'https://hack-or-snooze-v3.herokuapp.com';

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    const url = new URL(this.url);
    return url.hostname;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    try {
      // Note presence of `static` keyword: this indicates that getStories is
      //  **not** an instance method. Rather, it is a method that is called on the
      //  class directly. Why doesn't it make sense for getStories to be an
      //  instance method?

      // query the /stories endpoint (no auth required)
      const response = await axios({
        url: `${BASE_URL}/stories`,
        method: 'GET',
      });

      // turn plain old story objects from API into instances of Story class
      const stories = response.data.stories.map((story) => new Story(story));

      // build an instance of our own class using the new array of stories
      return new StoryList(stories);
    } catch (e) {
      // If not an API error, throw to avoid masking issues.
      if (!e.isAxiosError) {
        throw e;
      }
      // Return StoryList with empty list to display empty state.
      return new StoryList([]);
    }
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {author, title, url}
   *
   * Returns the ApiResponse(), where data = created Story.
   */

  async addStory(user, { author, title, url }) {
    try {
      const response = await axios({
        url: `${BASE_URL}/stories`,
        method: 'POST',
        data: { token: user.loginToken, story: { author, title, url } },
      });

      // Get story data from Response and update our data.
      const story = new Story(response.data.story);
      this.stories.unshift(story);
      currentUser.ownStories.unshift(story);

      return new ApiResponse(story);
    } catch (e) {
      return ApiResponse.parse(e);
    }
  }

  /**
   * Removes story from API, and updates our own data to reflect the changes.
   *  - storyId - Id for story to be deleted.
   *
   * Returns ApiResponse(), where data = deleted storyId.
   */

  async deleteStory(storyId) {
    try {
      const response = await axios({
        url: `${BASE_URL}/stories/${storyId}`,
        method: 'DELETE',
        data: { token: currentUser.loginToken },
      });

      // Get storyId of deleted story from Response and update StoryList data
      const deletedId = response.data.story.storyId;
      this.stories = this.stories.filter(
        ({ storyId }) => storyId !== deletedId
      );

      // Update User data
      currentUser.ownStories = currentUser.ownStories.filter(
        ({ storyId }) => storyId !== deletedId
      );
      currentUser.favorites = currentUser.favorites.filter(
        ({ storyId }) => storyId !== deletedId
      );

      return new ApiResponse(deletedId);
    } catch (e) {
      return ApiResponse.parse(e);
    }
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   *
   * Returns ApiResponse(), where data = created User.
   */

  static async signup(username, password, name) {
    try {
      const response = await axios({
        url: `${BASE_URL}/signup`,
        method: 'POST',
        data: { user: { username, password, name } },
      });

      let { user } = response.data;

      return new ApiResponse(
        new User(
          {
            username: user.username,
            name: user.name,
            createdAt: user.createdAt,
            favorites: user.favorites,
            ownStories: user.stories,
          },
          response.data.token
        )
      );
    } catch (e) {
      return ApiResponse.parse(e);
    }
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   * 
   * Returns ApiResponse(), where data = logged in User.
   */

  static async login(username, password) {
    try {
      const response = await axios({
        url: `${BASE_URL}/login`,
        method: 'POST',
        data: { user: { username, password } },
      });

      let { user } = response.data;

      return new ApiResponse(
        new User(
          {
            username: user.username,
            name: user.name,
            createdAt: user.createdAt,
            favorites: user.favorites,
            ownStories: user.stories,
          },
          response.data.token
        )
      );
    } catch (e) {
      return ApiResponse.parse(e);
    }
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: 'GET',
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error('loginViaStoredCredentials failed', err);
      return null;
    }
  }

  /**
   * Adds a story to the currentUser's favorite list.
   *  - story - Story to be favorited.
   *
   * Returns ApiResponse(), where data = true, indicating successful update.
   */

  async addFavorite(story) {
    return await this.updateFavorite('POST', story.storyId);
  }

  /**
   * Removes a story to the currentUser's favorite list.
   *  - story - Story to be unfavorited.
   *
   * Returns ApiResponse(), where data = true, indicating successful update.
   */

  async removeFavorite(story) {
    return await this.updateFavorite('DELETE', story.storyId);
  }

  /**
   * Updates the favorite status of a story, and uses the returned response
   * to ensure that this.favorites is up to date.
   *  - method - "POST" or "DELETE", depending on if you are adding / removing a favorite.
   *  - storyId - ID of the story to be updated.
   *
   * Returns ApiResponse(),where data = true, indicating successful update.
   */

  async updateFavorite(method, storyId) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
        method,
        data: { token: currentUser.loginToken },
      });

      // Set this.favorites to be equal to the updated favorites list.
      this.favorites = response.data.user.favorites.map(
        (fav) => new Story(fav)
      );

      // We aren't worried about the data, just that the operation is successful.
      // Lets the Presentation know favorite was successfully updated.
      return new ApiResponse(true);
    } catch (e) {
      return ApiResponse.parse(e);
    }
  }

  /** Utility function to indicate whether or not a given story is on the user's favorites list. */

  isFavorite(story) {
    return this.favorites.some(({ storyId }) => storyId === story.storyId);
  }

  /** Utility function to indicate whether or not a given story was created by the User */

  isOwn(story) {
    return this.ownStories.some(({ storyId }) => storyId === story.storyId);
  }
}

/**************************************************************************************
 * ApiResponse: Wrapper class that is returned to UI layer, containing data or error.
 */
class ApiResponse {
  constructor(data, error = null) {
    this.data = data;
    this.error = error;
  }

  static parse(e) {
    if (!e.isAxiosError) {
      // Unknown Error. Rethrowing to avoid masking issue.
      throw e;
    }
    return new ApiResponse(null, e.response.data.error);
  }
}
