import { useState, useContext } from "react";
import AuthContext from "./context/AuthContext";
import SubjectsContext from "./context/SubjectsContext";
import AppProviders from "./context/AppProviders";

import ParticleField from "./components/ui/ParticleField";
import LoadingScreen from "./components/ui/LoadingScreen";
import Sidebar from "./components/layout/Sidebar";

import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LibraryPage from "./pages/library/LibraryPage.jsx";
import StudySessionPage from "./pages/study/StudySessionPage";
import QuizPage from "./pages/quiz/QuizPage";

import "./styles/globals.css";
import "./styles/animations.css";
import "./styles/components.css";

function TuonApp() {
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState("login");
  const [onboarded, setOnboarded] = useState(false);
  const { user,     setUser }     = useContext(AuthContext);
  const { subjects }              = useContext(SubjectsContext);

  const handleLogin    = (u) => { setUser(u); setPage(subjects.length === 0 && !onboarded ? "onboarding" : "dashboard"); };
  const handleSignup   = (u) => { setUser(u); setPage("onboarding"); };
  const handleLogout   = ()  => { setUser(null); setPage("login"); };
  const handleOnboarded = () => { setOnboarded(true); setPage("dashboard"); };

  if (loading) return <LoadingScreen onDone={() => setLoading(false)} />;

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (!user) {
    if (page === "signup") return <SignUpPage onSignup={handleSignup} goLogin={() => setPage("login")} />;
    return <LoginPage onLogin={handleLogin} goSignup={() => setPage("signup")} />;
  }

  if (page === "onboarding") return <OnboardingPage user={user} onDone={handleOnboarded} />;

  // ── Authenticated page routing ────────────────────────────────────────────
  const renderPage = () => {
    if (page.startsWith("study:")) return <StudySessionPage subjectId={page.slice(6)} setPage={setPage} />;
    if (page.startsWith("quiz:"))  return <QuizPage         subjectId={page.slice(5)} setPage={setPage} />;
    if (page === "library")        return <LibraryPage       setPage={setPage} />;
    return <DashboardPage setPage={setPage} />;
  };

  return (
    <div style={{ display: "flex" }}>
      <ParticleField />
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout} />
      <main className="main-layout">{renderPage()}</main>
    </div>
  );
}

export default function Tuon() {
  return (
    <div id="tuon-root">
      <AppProviders>
        <TuonApp />
      </AppProviders>
    </div>
  );
}
