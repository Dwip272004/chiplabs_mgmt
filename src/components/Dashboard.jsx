import React, { useState, useEffect } from "react";
import { supabase, getProfile } from "../supabaseClient";

import DailyLogForm from "./DailyLogForm";
import MyProjects from "./MyProjects";
import ProjectManager from "./ProjectManager";
import TeamOverview from "./TeamOverview";
import MyProgress from "./MyProgress";
import SmartMeetingScheduler from "./SmartMeetingScheduler";
import MeetingLogForm from "./MeetingLogForm";
import GoogleCalendarConnect from "./GoogleCalendarConnect";


// --- Navigation Data ---
const internNav = [
  { name: "Daily Log", href: "daily-log", icon: "📝" },
  { name: "My Projects", href: "my-projects", icon: "🚀" },
  { name: "My Progress", href: "my-progress", icon: "📈" },
  { name: "Meetings & Feedback", href: "meetings-feedback", icon: "💬" },
];

const managerNav = [
  { name: "Team Overview", href: "team-overview", icon: "👥" },
  { name: "Daily Log", href: "daily-log", icon: "📝" },
  { name: "My Projects", href: "my-projects", icon: "🚀" },
  { name: "My Progress", href: "my-progress", icon: "📈" },
  { name: "Meetings & Feedback", href: "meetings-feedback", icon: "💬" },
  { name: "Admin Tools", href: "admin-tools", icon: "⚙️" },
  { name: "Smart Meeting Scheduler", href: "smart-scheduler", icon: "🗓️" },
];

const Dashboard = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [managerId, setManagerId] = useState(null);
  const [activeView, setActiveView] = useState("");
  const [loading, setLoading] = useState(true);
  const [googleToken, setGoogleToken] = useState(null);


  // --- Fetch Profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const userProfile = await getProfile(session.user.id);

      // Determine initial screen
      const initialView =
        userProfile?.role === "manager" ? "team-overview" : "daily-log";

      // Fetch manager ID (needed for interns)
      const { data: managerData } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "manager")
        .limit(1);

      if (managerData?.length > 0) {
        setManagerId(managerData[0].id);
      }

      setProfile(
        userProfile || {
          full_name: "New User",
          role: "intern",
          email: session.user.email,
        }
      );

      setActiveView(initialView);
      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  // Logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const navigation = profile?.role === "manager" ? managerNav : internNav;
  const isManager = profile?.role === "manager";

  if (loading || !profile || (!isManager && !managerId)) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading Dashboard...
      </div>
    );
  }

  // --- Render Views ---
  const renderContent = () => {
    switch (activeView) {
      case "daily-log":
        return <DailyLogForm session={session} />;

      case "my-projects":
        return <MyProjects session={session} />;

      case "my-progress":
        return <MyProgress session={session} />;

      case "team-overview":
        return <TeamOverview session={session} />;

      case "admin-tools":
        return <ProjectManager />;

      case "meetings-feedback": {
        const recipientId = isManager ? session.user.id : managerId;
        return (
          <MeetingLogForm session={session} managerId={recipientId} />
        );
      }

      case 'smart-scheduler':
        return (
          <SmartMeetingScheduler
            session={session}
            googleToken={googleToken}
            setGoogleToken={setGoogleToken}
          />
        );




      default:
        return <div className="p-8">Select a view from the sidebar.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col fixed h-full">
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <h1 className="text-xl font-bold">Intern Tracker</h1>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveView(item.href)}
              className={`w-full flex items-center px-4 py-2 text-sm rounded-md ${
                activeView === item.href
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <p className="text-sm font-medium truncate">
            {profile.full_name || profile.email}
          </p>
          <p className="text-xs text-gray-400 capitalize">{profile.role}</p>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="mt-3 w-full text-left text-sm text-red-400 hover:text-red-300"
          >
            {loading ? "Logging Out..." : "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b shadow-sm">
          <h2 className="text-2xl font-semibold">
            {isManager ? "Manager Dashboard" : "Intern Work Space"}
          </h2>
          <div className="text-sm text-gray-500">
            Welcome, {profile.full_name || "User"}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
