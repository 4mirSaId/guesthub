export default function NightShows() {
  const weekA = [
    { day: 'Monday', show: 'Variety Show', emoji: '🎭' },
    { day: 'Tuesday', show: 'Karaoke Hits', emoji: '🎤' },
    { day: 'Wednesday', show: 'Tunisian Night', emoji: '🇹🇳' },
    { day: 'Thursday', show: 'Dance Around the World', emoji: '🌍' },
    { day: 'Friday', show: 'Miss Hotel Name', emoji: '👑' },
    { day: 'Saturday', show: 'Acting Show', emoji: '🎬' },
    { day: 'Sunday', show: 'White Party', emoji: '⚪' },
  ];

  const weekB = [
    { day: 'Monday', show: 'Mix Show', emoji: '🔀' },
    { day: 'Tuesday', show: 'Games and Dance (Rosa Talent)', emoji: '🎮' },
    { day: 'Wednesday', show: 'Tunisian Beats', emoji: '🥁' },
    { day: 'Thursday', show: 'Comedy Show', emoji: '😂' },
    { day: 'Friday', show: 'Mister Hotel Name', emoji: '🤴' },
    { day: 'Saturday', show: 'Best of Rosa', emoji: '⭐' },
    { day: 'Sunday', show: 'Pink Party', emoji: '🩷' },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-6xl mx-auto py-20 px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white">Night Shows 🎭</h1>
          <p className="text-xl text-slate-400 mt-4">
            Explore the weekly night show program for Week A and Week B.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl shadow-xl shadow-black/20 border border-slate-800 bg-slate-900 p-8 transition-all duration-300 ease-in-out hover:shadow-black/40">
            <h2 className="text-3xl font-semibold text-white mb-6">Week A</h2>
            <div className="space-y-4">
              {weekA.map((item) => (
                <div key={item.day} className="rounded-2xl bg-slate-950 p-5 border border-slate-800 shadow-lg shadow-black/20 transition hover:border-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{item.day}</p>
                      <p className="text-xl font-semibold text-white mt-2">{item.show}</p>
                    </div>
                    <span className="text-3xl">{item.emoji}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl shadow-xl shadow-black/20 border border-slate-800 bg-slate-900 p-8 transition-all duration-300 ease-in-out hover:shadow-black/40">
            <h2 className="text-3xl font-semibold text-white mb-6">Week B</h2>
            <div className="space-y-4">
              {weekB.map((item) => (
                <div key={item.day} className="rounded-2xl bg-slate-950 p-5 border border-slate-800 shadow-lg shadow-black/20 transition hover:border-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{item.day}</p>
                      <p className="text-xl font-semibold text-white mt-2">{item.show}</p>
                    </div>
                    <span className="text-3xl">{item.emoji}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}