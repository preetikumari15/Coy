const test = require('node:test');
const assert = require('node:assert/strict');
const { getFeed, recordSwipe, getMatches, resetStore } = require('./db');

test('Coy Discover Backend & Privacy Logic', async (t) => {
  // Reset to clean 32-profile seed before testing
  resetStore();

  await t.test('1. GET /feed seeds 30+ profiles and NEVER leaks likedCurrentUser', () => {
    const feed = getFeed();
    assert.ok(feed.length >= 30, 'Expected at least 30 seeded profiles');

    for (const profile of feed) {
      assert.equal(
        'likedCurrentUser' in profile,
        false,
        `Privacy breach: likedCurrentUser leaked on profile ${profile.id}`
      );
    }
  });

  await t.test('2. Swiped profiles never reappear in feed', () => {
    const initialFeed = getFeed();
    const firstUser = initialFeed[0]; // Aarav (idx 0 -> likedCurrentUser: false)

    const swipeResult = recordSwipe(firstUser.id, 'like');
    assert.equal(swipeResult.isMatch, false, 'One-sided like should not match');

    const updatedFeed = getFeed();
    assert.equal(updatedFeed.length, initialFeed.length - 1);
    assert.equal(
      updatedFeed.some((p) => p.id === firstUser.id),
      false,
      'Swiped profile must never appear again'
    );
  });

  await t.test('3. Mutual like triggers a match and persists in GET /matches', () => {
    const feed = getFeed();
    const mutualCandidate = feed.find((p) => p.id === 'user_2'); // Ananya (idx 1 -> likedCurrentUser: true)
    assert.ok(mutualCandidate, 'Expected user_2 in feed');

    const swipeResult = recordSwipe(mutualCandidate.id, 'like');
    assert.equal(swipeResult.isMatch, true, 'Mutual like must return isMatch: true');
    assert.equal(swipeResult.matchedProfile.id, 'user_2');

    const matches = getMatches();
    assert.equal(matches.length, 1);
    assert.equal(matches[0].profile.id, 'user_2');
  });

  await t.test('4. Passing on someone who liked the user does NOT match or reveal them', () => {
    const feed = getFeed();
    const secretAdmirer = feed.find((p) => p.id === 'user_5'); // idx 4 -> likedCurrentUser: true
    assert.ok(secretAdmirer, 'Expected user_5 in feed');

    const swipeResult = recordSwipe(secretAdmirer.id, 'pass');
    assert.equal(swipeResult.isMatch, false);
    assert.equal(swipeResult.matchedProfile, null);

    // Matches count must still be 1
    assert.equal(getMatches().length, 1);
  });

  // Restore clean state after tests finish
  resetStore();
});