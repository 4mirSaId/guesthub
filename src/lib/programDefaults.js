const DEFAULT_ACTIVITIES = [
  { time: '09:30', name: 'Meditation ðŸ§˜â€â™‚ï¸' },
  { time: '10:00', name: 'Yoga & Inspiration ðŸ§˜â€â™€ï¸' },
  { time: '10:30', name: 'Darts ðŸŽ¯' },
  { time: '11:00', name: 'Volley Ball ðŸ' },
  { time: '11:30', name: 'Aqua Gym ðŸŒŠ' },
  { time: '12:00', name: 'Mid-journey Game â˜€ï¸' },
  { time: '15:00', name: 'Water Polo ðŸ¤½â€â™‚ï¸' },
  { time: '15:30', name: 'French Boules ðŸŽ¯' },
  { time: '16:00', name: 'Football âš½' },
  { time: '16:30', name: 'Dance Course ðŸ’ƒ' },
];

const DEFAULT_NIGHT_SHOWS = {
  weekA: [
    { day: 'Monday', show: 'Variety Show', emoji: 'ðŸŽ­' },
    { day: 'Tuesday', show: 'Karaoke Hits', emoji: 'ðŸŽ¤' },
    { day: 'Wednesday', show: 'Tunisian Night', emoji: 'ðŸ‡¹ðŸ‡³' },
    { day: 'Thursday', show: 'Dance Around the World', emoji: 'ðŸŒ' },
    { day: 'Friday', show: 'Miss Hotel', emoji: 'ðŸ‘‘' },
    { day: 'Saturday', show: 'Acting Show', emoji: 'ðŸŽ¬' },
    { day: 'Sunday', show: 'White Party', emoji: 'âšª' },
  ],
  weekB: [
    { day: 'Monday', show: 'Mix Show', emoji: 'ðŸ”€' },
    { day: 'Tuesday', show: 'Games and Dance', emoji: 'ðŸŽ®' },
    { day: 'Wednesday', show: 'Tunisian Beats', emoji: 'ðŸ¥' },
    { day: 'Thursday', show: 'Comedy Show', emoji: 'ðŸ˜‚' },
    { day: 'Friday', show: 'Mister Hotel', emoji: 'ðŸ¤´' },
    { day: 'Saturday', show: 'Best of Hotel', emoji: 'â­' },
    { day: 'Sunday', show: 'Pink Party', emoji: 'ðŸ©·' },
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

export function getDefaultProgram() {
  return {
    activities: DEFAULT_ACTIVITIES.map((item, order) => ({ ...item, order })),
    nightShows: {
      weekA: DEFAULT_NIGHT_SHOWS.weekA.map((item, order) => ({ ...item, order })),
      weekB: DEFAULT_NIGHT_SHOWS.weekB.map((item, order) => ({ ...item, order })),
    },
    kidsClub: DEFAULT_KIDS_CLUB.map((item, order) => ({
      day: item.day,
      order,
      sessions: item.sessions.map((session) => ({ ...session })),
    })),
  };
}
