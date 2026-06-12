import { useState, useEffect, useRef } from "react";

const teams = [
  {
    id: "heroui",
    name: "HeroUI",
    badge: (
      <svg viewBox="0 0 16 16" width="12" height="12" fill="white">
        <path d="M4 2h8l2 4-6 8-6-8z" />
      </svg>
    ),
    badgeStyle: { background: "#e84f4f" },
  },
  {
    id: "acme",
    name: "Acme Studio",
    badge: "AS",
    badgeStyle: { background: "#4f8ef8", fontSize: "9px", fontWeight: 700 },
  },
  {
    id: "moonshot",
    name: "Moonshot Inc.",
    badge: "MS",
    badgeStyle: { background: "#f8a54f", fontSize: "9px", fontWeight: 700 },
  },
];

const navLinks = ["Dashboard", "Projects", "Members", "Billing"];

function TeamBadge({ team }) {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        flexShrink: 0,
        ...team.badgeStyle,
      }}
    >
      {team.badge}
    </div>
  );
}

export default function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState(teams[0]);
  const [activeLink, setActiveLink] = useState("Dashboard");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#09090b", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          height: 56,
          padding: "0 20px",
          background: "#18181b",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "relative",
          zIndex: 50,
        }}
      >
        {/* Team Switcher */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 8px",
              borderRadius: 8,
              background: dropdownOpen ? "rgba(255,255,255,0.06)" : "transparent",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = dropdownOpen ? "rgba(255,255,255,0.06)" : "transparent")
            }
          >
            {/* Brand icon */}
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: "#e84f4f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 16 16" width="12" height="12" fill="white">
                <path d="M4 2h8l2 4-6 8-6-8z" />
              </svg>
            </div>
            {activeTeam.name}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                marginLeft: 2,
                opacity: 0.5,
                transition: "transform 0.15s",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                minWidth: 220,
                background: "#1c1c1f",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 6,
                boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
              }}
            >
              {/* Team settings */}
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 7,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  textAlign: "left",
                  marginBottom: 4,
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  paddingBottom: 12,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Team settings
              </button>

              {/* Teams */}
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    setActiveTeam(team);
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 7,
                    background: activeTeam.id === team.id ? "rgba(255,255,255,0.06)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: activeTeam.id === team.id ? 500 : 400,
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      activeTeam.id === team.id ? "rgba(255,255,255,0.06)" : "transparent")
                  }
                >
                  <TeamBadge team={team} />
                  <span style={{ flex: 1 }}>{team.name}</span>
                  {activeTeam.id === team.id && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7l3 3 6-6" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}

              <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "6px 0" }} />

              {/* Create workspace */}
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 7,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M7.5 2v11M2 7.5h11" />
                </svg>
                Create workspace...
              </button>
            </div>
          )}
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", margin: "0 8px" }} />

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => setActiveLink(link)}
              style={{
                padding: "5px 10px",
                borderRadius: 7,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeLink === link ? 500 : 400,
                color: activeLink === link ? "#fff" : "rgba(255,255,255,0.45)",
                transition: "color 0.1s, background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (activeLink !== link) e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = activeLink === link ? "#fff" : "rgba(255,255,255,0.45)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {link}
            </button>
          ))}
        </div>

        {/* Right icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Search */}
          <button style={iconBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="6.5" cy="6.5" r="4.5" />
              <path d="M10.5 10.5l3 3" />
            </svg>
          </button>
          {/* Bell */}
          <button style={iconBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2a5 5 0 0 1 5 5v2l1 2H2l1-2V7a5 5 0 0 1 5-5z" />
              <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
            </svg>
          </button>
          {/* Avatar */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#e07b54",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "white",
              cursor: "pointer",
              marginLeft: 2,
            }}
          >
            JD
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div style={{ padding: "40px 24px" }}>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{activeLink}</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7 }}>
          Workspace actif : <span style={{ color: "rgba(255,255,255,0.7)" }}>{activeTeam.name}</span>
        </p>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "rgba(255,255,255,0.45)",
  transition: "background 0.1s, color 0.1s",
};

