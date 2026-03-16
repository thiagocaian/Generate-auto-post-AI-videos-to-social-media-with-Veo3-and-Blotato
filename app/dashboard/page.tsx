import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/sign-in");

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className="font-semibold text-lg">DataAI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="h-8 w-8 rounded-full"
              />
            )}
            <span className="text-sm text-gray-700 font-medium">{session.user.name}</span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-2">Your AI data analysis dashboard is ready.</p>
        </div>

        {/* Placeholder cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Data Sources", value: "0", icon: "🔗" },
            { label: "Queries Run", value: "0", icon: "⚡" },
            { label: "Dashboards", value: "0", icon: "📊" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Video Campaign Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-xs font-medium mb-1">AI VIDEO CAMPAIGN</p>
              <h3 className="text-xl font-bold mb-1">goodMix Superfoods</h3>
              <p className="text-indigo-200 text-sm">Generate & auto-post videos with Veo3 + Blotato</p>
            </div>
            <span className="text-5xl">🎬</span>
          </div>
          <a
            href="/dashboard/video"
            className="mt-4 inline-block bg-white text-indigo-600 font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-indigo-50 transition-colors"
          >
            Launch Campaign →
          </a>
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connect your first data source</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Import a CSV, connect a database, or integrate via API to start asking questions about your data.
          </p>
          <button className="bg-indigo-600 text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-indigo-700 transition-colors">
            + Connect data source
          </button>
        </div>
      </div>
    </main>
  );
}
