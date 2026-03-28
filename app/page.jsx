import Link from "next/link";

export default function Home() {
  const features = [
    { icon: "💰", title: "Income Tracking",   desc: "Salary, business, rent, FD" },
    { icon: "📉", title: "Deductions",         desc: "80C, 80D auto apply" },
    { icon: "🧾", title: "TDS Management",     desc: "Form 16 / 26AS data" },
    { icon: "🧮", title: "Tax Calculator",     desc: "Old vs New regime compare" },
    { icon: "📄", title: "ITR-1 & ITR-4",     desc: "Salaried + Freelancer" },
    { icon: "✅", title: "Filing Ready",       desc: "Summary report generate" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 text-center">
      <div>
        <h1 className="text-5xl font-bold text-blue-400 mb-3">ITR Filing App</h1>
        <p className="text-gray-400 text-lg">Apna income tax khud calculate karo — CA ke bina 🇮🇳</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
        {features.map((f) => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left">
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="font-semibold text-sm">{f.title}</div>
            <div className="text-gray-500 text-xs mt-1">{f.desc}</div>
          </div>
        ))}
      </div>
      <Link href="/login"
        className="bg-blue-500 px-8 py-3 rounded-xl text-white font-bold text-lg hover:bg-blue-400 transition">
        Start Filing →
      </Link>
    </div>
  );
}
