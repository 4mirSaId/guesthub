const DEFAULT_ACTIVITIES = [
  { time: '09:30', name: 'Meditation 🧘‍♂️' },
  { time: '10:00', name: 'Yoga & Inspiration 🧘‍♀️' },
  { time: '10:30', name: 'Darts 🎯' },
  { time: '11:00', name: 'Volley Ball 🏐' },
  { time: '11:30', name: 'Aqua Gym 🌊' },
  { time: '12:00', name: 'Mid-journey Game ☀️' },
  { time: '15:00', name: 'Water Polo 🤽‍♂️' },
  { time: '15:30', name: 'French Boules 🎯' },
  { time: '16:00', name: 'Football ⚽' },
  { time: '16:30', name: 'Dance Course 💃' },
];

const DEFAULT_NIGHT_SHOWS = {
  weekA: [
    { day: 'Monday', show: 'Variety Show', emoji: '🎭' },
    { day: 'Tuesday', show: 'Karaoke Hits', emoji: '🎤' },
    { day: 'Wednesday', show: 'Tunisian Night', emoji: '🇹🇳' },
    { day: 'Thursday', show: 'Dance Around the World', emoji: '🌍' },
    { day: 'Friday', show: 'Miss Hotel', emoji: '👑' },
    { day: 'Saturday', show: 'Acting Show', emoji: '🎬' },
    { day: 'Sunday', show: 'White Party', emoji: '⚪' },
  ],
  weekB: [
    { day: 'Monday', show: 'Mix Show', emoji: '🔀' },
    { day: 'Tuesday', show: 'Games and Dance', emoji: '🎮' },
    { day: 'Wednesday', show: 'Tunisian Beats', emoji: '🥁' },
    { day: 'Thursday', show: 'Comedy Show', emoji: '😂' },
    { day: 'Friday', show: 'Mister Hotel', emoji: '🤴' },
    { day: 'Saturday', show: 'Best of Hotel', emoji: '⭐' },
    { day: 'Sunday', show: 'Pink Party', emoji: '🩷' },
  ],
};

const DEFAULT_KIDS_CLUB = [
  { day: 'Monday', sessions: [{ label: 'Morning', startTime: '10:00', endTime: '12:00' }, { label: 'Afternoon', startTime: '15:00', endTime: '17:00' }] },
  { day: 'Tuesday', sessions: [{ label: 'Morning', startTime: '10:00', endTime: '12:00' }, { label: 'Afternoon', startTime: '15:00', endTime: '17:00' }] },
  { day: 'Wednesday', sessions: [{ label: 'Morning', startTime: '10:00', endTime: '12:00' }, { label: 'Afternoon', startTime: '15:00', endTime: '17:00' }] },
  { day: 'Thursday', sessions: [{ label: 'Morning', startTime: '10:00', endTime: '12:00' }, { label: 'Afternoon', startTime: '15:00', endTime: '17:00' }] },
  { day: 'Friday', sessions: [{ label: 'Morning', startTime: '10:00', endTime: '12:00' }, { label: 'Afternoon', startTime: '15:00', endTime: '17:00' }] },
  { day: 'Saturday', sessions: [{ label: 'Morning', startTime: '10:00', endTime: '12:00' }, { label: 'Afternoon', startTime: '15:00', endTime: '17:00' }] },
];

function getDefaultProgram() {
  return {
    activities: DEFAULT_ACTIVITIES.map((item, order) => ({ ...item, order })),
    nightShows: {
      weekA: DEFAULT_NIGHT_SHOWS.weekA.map((item, order) => ({ ...item, order })),
      weekB: DEFAULT_NIGHT_SHOWS.weekB.map((item, order) => ({ ...item, order })),
    },
    kidsClub: DEFAULT_KIDS_CLUB.map((item, order) => ({
      day: item.day,
      order,
      sessions: item.sessions.map((s) => ({ ...s })),
    })),
  };
}

module.exports = { getDefaultProgram };
