export default function Activities() {
  const activities = [
    { time: "09:30", name: "Meditation au Grand Air 🧘‍♂️" },
    { time: "10:00", name: "Yoga & Inspiration 🧘‍♀️" },
    { time: "10:30", name: "Fléchettes 🎯" },
    { time: "11:00", name: "Volley Ball 🏐" },
    { time: "11:30", name: "Aqua Gym 🌊" },
    { time: "12:00", name: "Plaisirs Aquatiques ☀️" },
    { time: "15:00", name: "Water Polo 🤽‍♂️" },
    { time: "15:30", name: "Pétanque 🎯" },
    { time: "16:00", name: "Football ⚽" },
    { time: "16:30", name: "Cours de Danse 💃" },
  ];

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      <div className="max-w-6xl mx-auto py-20 px-6">
        <h1 className="text-5xl font-bold mb-12 text-center text-gray-800">
          Today&apos;s Activities 📅
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {activities.map((act, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] border border-gray-100 transition-all duration-300 ease-in-out"
            >
              <span className="text-2xl font-bold text-emerald-500 block mb-2">{act.time}</span>
              <span className="text-lg text-gray-700">{act.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}