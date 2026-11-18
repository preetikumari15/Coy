const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'store.json');

function generateSeedData() {
  const colleges = [
    'DU North Campus', 'DTU', 'NSUT', 'IIT Delhi',
    'Ashoka University', 'GGSIPU', 'Miranda House', 'Amity Noida'
  ];
  const names = [
    'Aarav', 'Ananya', 'Kabir', 'Meera', 'Rohan', 'Diya', 'Vikram', 'Ishita',
    'Aditya', 'Kavya', 'Siddharth', 'Naina', 'Arjun', 'Rhea', 'Dev', 'Tara',
    'Karan', 'Sanya', 'Nikhil', 'Pooja', 'Yash', 'Zoya', 'Pranav', 'Myra',
    'Aryan', 'Aisha', 'Rahul', 'Simran', 'Varun', 'Kiara', 'Harsh', 'Avni'
  ];
  const bios = [
    'Coffee snob, weekend trekker, and terrible at bowling.',
    'Building side projects by day, hunting for the best momos by night.',
    'Looking for someone to debate movies with over iced lattes.',
    'CS undergrad who actually touches grass on Sundays.',
    'Vinyl collector, amateur photographer, dog person.',
    'Always down for spontaneous late-night drives and street food.'
  ];
  const interestsPool = [
    'Coffee', 'Indie Music', 'Hackathons', 'Photography', 'Cricket',
    'F1', 'Reading', 'Street Food', 'Fitness', 'Travel', 'Art', 'Gaming'
  ];

  // 32 mock profiles seeded; ~33% have already liked the current user
  const profiles = names.map((name, idx) => ({
    id: `user_${idx + 1}`,
    name,
    age: 19 + (idx % 6),
    photo: `https://api.dicebear.com/9.x/notionists/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`,
    bio: bios[idx % bios.length],
    affiliation: colleges[idx % colleges.length],
    interests: [
      interestsPool[idx % interestsPool.length],
      interestsPool[(idx + 3) % interestsPool.length],
      interestsPool[(idx + 7) % interestsPool.length],
    ],
    likedCurrentUser: idx % 3 === 1, // Internal only — never sent in /feed
  }));

  return { profiles, swipes: {}, matches: [] };
}

function readStore() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = generateSeedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeStore(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Strip private incoming-like metadata before returning to client
function sanitizeProfile(profile) {
  const { likedCurrentUser, ...publicFields } = profile;
  return publicFields;
}

function getFeed() {
  const store = readStore();
  return store.profiles
    .filter((p) => !(p.id in store.swipes))
    .map(sanitizeProfile);
}

function recordSwipe(profileId, action) {
  const store = readStore();
  const target = store.profiles.find((p) => p.id === profileId);
  if (!target) {
    throw new Error('Profile not found');
  }

  // Idempotency check if already swiped
  if (store.swipes[profileId]) {
    const existing = store.matches.find((m) => m.profile.id === profileId);
    return { isMatch: Boolean(existing), matchedProfile: existing?.profile || null };
  }

  store.swipes[profileId] = action;

  let isMatch = false;
  let matchedProfile = null;

  if (action === 'like' && target.likedCurrentUser) {
    isMatch = true;
    matchedProfile = sanitizeProfile(target);
    store.matches.unshift({
      profile: matchedProfile,
      matchedAt: new Date().toISOString(),
    });
  }

  writeStore(store);
  return { isMatch, matchedProfile };
}

function getMatches() {
  const store = readStore();
  return store.matches;
}

function resetStore() {
  const fresh = generateSeedData();
  writeStore(fresh);
  return fresh;
}

module.exports = { getFeed, recordSwipe, getMatches, resetStore };