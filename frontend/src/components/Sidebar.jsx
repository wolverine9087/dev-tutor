function Sidebar({
    activePage = "dashboard",
    onNavigate,
    user,
    onProfile,
}) {
    const links = [
        {
            id: "dashboard",
            label: "Overview",
            icon: "⌂",
        },
        {
            id: "curriculum",
            label: "Learn",
            icon: "◈",
        },
        {
            id: "progress",
            label: "Progress",
            icon: "◒",
        },
        {
            id: "quiz",
            label: "Practice",
            icon: "✓",
        },
        {
            id: "chat",
            label: "AI Tutor",
            icon: "✦",
        },
    ];

    return (
        <aside
            className="sidebar"
            aria-label="Main navigation"
        >
            {/* Brand */}
            <button
                className="sidebar-brand"
                onClick={() => onNavigate("dashboard")}
            >
                <span className="brand-mark">✦</span>

                <span>
                    lumio
                    <span className="brand-dot">.</span>
                </span>
            </button>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <span className="sidebar-label">
                    WORKSPACE
                </span>

                {links.map((link) => (
                    <button
                        key={link.id}
                        className={
                            activePage === link.id
                                ? "sidebar-link active"
                                : "sidebar-link"
                        }
                        onClick={() => onNavigate(link.id)}
                        aria-current={
                            activePage === link.id
                                ? "page"
                                : undefined
                        }
                    >
                        <span className="sidebar-icon">
                            {link.icon}
                        </span>

                        <span>{link.label}</span>
                    </button>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="sidebar-bottom">
                {/* Tip */}
                <div className="sidebar-tip">
                    <span>✦</span>

                    <div>
                        <strong>Keep going.</strong>
                        <small>
                            Consistency beats intensity.
                        </small>
                    </div>
                </div>

                {/* Profile */}
                <button
                    className="sidebar-profile"
                    onClick={onProfile}
                >
                    <span className="profile-button small">
                        {user?.fullName?.slice(0, 1) || "A"}
                    </span>

                    <span className="profile-info">
                        <strong>
                            {user?.fullName || "Guest learner"}
                        </strong>

                        <small>
                            {user
                                ? "Your account"
                                : "Sign in to sync"}
                        </small>
                    </span>

                    <span className="sidebar-more">
                        •••
                    </span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;