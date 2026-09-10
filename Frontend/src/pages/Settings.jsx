import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaShieldAlt,
  FaNetworkWired,
  FaFileAlt,
  FaBrain,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaBell,
  FaLock,
  FaSlidersH,
  FaSave,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    organization: "Network Security Organization",
    timezone: "Asia/Kolkata",
    language: "English",
    defaultFramework: "CIS",
  });

  const [notifications, setNotifications] = useState({
    auditCompleted: true,
    criticalFinding: true,
    trainingRequired: true,
    reportGenerated: true,
  });

  const [security, setSecurity] = useState({
    sessionTimeout: "30",
    requireApproval: true,
    twoFactor: false,
  });

  const [aiSettings, setAiSettings] = useState({
    confidenceThreshold: 85,
    autoMapping: false,
    requireHumanApproval: true,
  });

  const [profile, setProfile] = useState({
    name: "Network Administrator",
    email: "admin@example.com",
    role: "Administrator",
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPassword: false,
    confirm: false,
  });

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();

    if (
      !password.current ||
      !password.newPassword ||
      !password.confirm
    ) {
      return;
    }

    if (password.newPassword !== password.confirm) {
      alert("New passwords do not match.");
      return;
    }

    setPassword({
      current: "",
      newPassword: "",
      confirm: "",
    });

    alert("Password updated successfully.");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#07152f] text-white lg:flex">

          <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <FaShieldAlt className="text-lg" />
            </div>

            <div>
              <p className="text-sm font-bold leading-tight">
                AI Network Security
              </p>

              <p className="text-sm font-bold leading-tight text-blue-400">
                Auditor
              </p>
            </div>

          </div>

          <nav className="flex-1 px-4 py-6">

            <SidebarLink
              to="/dashboard"
              icon={<FaNetworkWired />}
              label="Dashboard"
            />

            <SidebarLink
              to="/configurations"
              icon={<FaFileAlt />}
              label="Configurations"
            />

            <SidebarLink
              to="/topology"
              icon={<FaNetworkWired />}
              label="Network Topology"
            />

            <SidebarLink
              to="/ai-training"
              icon={<FaBrain />}
              label="AI Training"
            />

            <SidebarLink
              to="/compliance"
              icon={<FaShieldAlt />}
              label="Audit & Compliance"
            />

            <SidebarLink
              to="/reports"
              icon={<FaChartBar />}
              label="Reports"
            />

            <SidebarLink
              to="/settings"
              icon={<FaCog />}
              label="Settings"
            />

          </nav>

          <div className="border-t border-white/10 px-4 py-5">

            <NavLink
              to="/"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <FaSignOutAlt />
              Exit Dashboard
            </NavLink>

          </div>

        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 lg:ml-64">

          {/* Header */}
          <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 lg:px-8">

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Settings
              </h1>

              <p className="text-sm text-slate-500">
                Manage your account and auditor preferences
              </p>
            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

                <p className="text-sm font-semibold text-slate-800">
                  Network Administrator
                </p>

                <p className="text-xs text-slate-500">
                  Administrator
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                A
              </div>

            </div>

          </header>

          {/* Content */}
          <div className="p-6 lg:p-8">

            <section className="mb-6">

              <p className="text-sm font-semibold text-blue-600">
                System Configuration
              </p>

              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Settings
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Configure your profile, security preferences, notifications and AI auditor behavior.
              </p>

            </section>

            {/* Settings Layout */}
            <section className="grid gap-6 lg:grid-cols-[240px_1fr]">

              {/* Settings Navigation */}
              <div className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

                <SettingsNav
                  active={activeSection === "general"}
                  onClick={() => setActiveSection("general")}
                  icon={<FaCog />}
                  label="General"
                />

                <SettingsNav
                  active={activeSection === "profile"}
                  onClick={() => setActiveSection("profile")}
                  icon={<FaUser />}
                  label="Profile"
                />

                <SettingsNav
                  active={activeSection === "notifications"}
                  onClick={() => setActiveSection("notifications")}
                  icon={<FaBell />}
                  label="Notifications"
                />

                <SettingsNav
                  active={activeSection === "security"}
                  onClick={() => setActiveSection("security")}
                  icon={<FaLock />}
                  label="Security"
                />

                <SettingsNav
                  active={activeSection === "ai"}
                  onClick={() => setActiveSection("ai")}
                  icon={<FaBrain />}
                  label="AI Preferences"
                />

              </div>

              {/* Settings Content */}
              <div className="min-w-0">

                {/* General */}
                {activeSection === "general" && (

                  <SettingsCard
                    title="General Settings"
                    description="Configure the basic behavior of your security auditing platform."
                  >

                    <div className="grid gap-5 sm:grid-cols-2">

                      <FormField label="Organization Name">
                        <input
                          type="text"
                          value={general.organization}
                          onChange={(event) =>
                            setGeneral({
                              ...general,
                              organization: event.target.value,
                            })
                          }
                          className="input"
                        />
                      </FormField>

                      <FormField label="Default Compliance Framework">

                        <select
                          value={general.defaultFramework}
                          onChange={(event) =>
                            setGeneral({
                              ...general,
                              defaultFramework: event.target.value,
                            })
                          }
                          className="input"
                        >
                          <option>CIS</option>
                          <option>NIST SP 800-53</option>
                          <option>DISA STIG</option>
                          <option>ISO/IEC 27001</option>
                        </select>

                      </FormField>

                      <FormField label="Timezone">

                        <select
                          value={general.timezone}
                          onChange={(event) =>
                            setGeneral({
                              ...general,
                              timezone: event.target.value,
                            })
                          }
                          className="input"
                        >
                          <option value="Asia/Kolkata">
                            Asia/Kolkata
                          </option>
                          <option value="UTC">
                            UTC
                          </option>
                          <option value="America/New_York">
                            America/New_York
                          </option>
                          <option value="Europe/London">
                            Europe/London
                          </option>
                        </select>

                      </FormField>

                      <FormField label="Language">

                        <select
                          value={general.language}
                          onChange={(event) =>
                            setGeneral({
                              ...general,
                              language: event.target.value,
                            })
                          }
                          className="input"
                        >
                          <option>English</option>
                        </select>

                      </FormField>

                    </div>

                    <SaveButton
                      onClick={handleSave}
                      saved={saved}
                    />

                  </SettingsCard>

                )}

                {/* Profile */}
                {activeSection === "profile" && (

                  <div className="space-y-6">

                    <SettingsCard
                      title="Profile"
                      description="Manage the information associated with your administrator account."
                    >

                      <div className="grid gap-5 sm:grid-cols-2">

                        <FormField label="Full Name">

                          <input
                            type="text"
                            value={profile.name}
                            onChange={(event) =>
                              setProfile({
                                ...profile,
                                name: event.target.value,
                              })
                            }
                            className="input"
                          />

                        </FormField>

                        <FormField label="Email Address">

                          <input
                            type="email"
                            value={profile.email}
                            onChange={(event) =>
                              setProfile({
                                ...profile,
                                email: event.target.value,
                              })
                            }
                            className="input"
                          />

                        </FormField>

                        <FormField label="Role">

                          <input
                            type="text"
                            value={profile.role}
                            disabled
                            className="input cursor-not-allowed opacity-60"
                          />

                        </FormField>

                      </div>

                      <SaveButton
                        onClick={handleSave}
                        saved={saved}
                      />

                    </SettingsCard>

                    <SettingsCard
                      title="Change Password"
                      description="Update your account password."
                    >

                      <form
                        onSubmit={handlePasswordChange}
                        className="max-w-xl space-y-5"
                      >

                        <PasswordField
                          label="Current Password"
                          value={password.current}
                          visible={showPasswords.current}
                          onChange={(value) =>
                            setPassword({
                              ...password,
                              current: value,
                            })
                          }
                          onToggle={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current,
                            })
                          }
                        />

                        <PasswordField
                          label="New Password"
                          value={password.newPassword}
                          visible={showPasswords.newPassword}
                          onChange={(value) =>
                            setPassword({
                              ...password,
                              newPassword: value,
                            })
                          }
                          onToggle={() =>
                            setShowPasswords({
                              ...showPasswords,
                              newPassword: !showPasswords.newPassword,
                            })
                          }
                        />

                        <PasswordField
                          label="Confirm New Password"
                          value={password.confirm}
                          visible={showPasswords.confirm}
                          onChange={(value) =>
                            setPassword({
                              ...password,
                              confirm: value,
                            })
                          }
                          onToggle={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                        />

                        <button
                          type="submit"
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          <FaLock />
                          Update Password
                        </button>

                      </form>

                    </SettingsCard>

                  </div>

                )}

                {/* Notifications */}
                {activeSection === "notifications" && (

                  <SettingsCard
                    title="Notifications"
                    description="Choose which security events should generate notifications."
                  >

                    <div className="space-y-1">

                      <ToggleRow
                        title="Audit completed"
                        description="Notify when a configuration audit finishes."
                        enabled={notifications.auditCompleted}
                        onChange={() =>
                          setNotifications({
                            ...notifications,
                            auditCompleted:
                              !notifications.auditCompleted,
                          })
                        }
                      />

                      <ToggleRow
                        title="Critical finding detected"
                        description="Notify when a critical security issue is discovered."
                        enabled={notifications.criticalFinding}
                        onChange={() =>
                          setNotifications({
                            ...notifications,
                            criticalFinding:
                              !notifications.criticalFinding,
                          })
                        }
                      />

                      <ToggleRow
                        title="AI training required"
                        description="Notify when the auditor finds an unknown configuration pattern."
                        enabled={notifications.trainingRequired}
                        onChange={() =>
                          setNotifications({
                            ...notifications,
                            trainingRequired:
                              !notifications.trainingRequired,
                          })
                        }
                      />

                      <ToggleRow
                        title="Report generated"
                        description="Notify when a compliance report is ready."
                        enabled={notifications.reportGenerated}
                        onChange={() =>
                          setNotifications({
                            ...notifications,
                            reportGenerated:
                              !notifications.reportGenerated,
                          })
                        }
                      />

                    </div>

                    <SaveButton
                      onClick={handleSave}
                      saved={saved}
                    />

                  </SettingsCard>

                )}

                {/* Security */}
                {activeSection === "security" && (

                  <SettingsCard
                    title="Security Settings"
                    description="Configure account and administrator security preferences."
                  >

                    <div className="space-y-1">

                      <ToggleRow
                        title="Require approval before applying AI mappings"
                        description="Administrators must approve AI-generated configuration mappings."
                        enabled={security.requireApproval}
                        onChange={() =>
                          setSecurity({
                            ...security,
                            requireApproval:
                              !security.requireApproval,
                          })
                        }
                      />

                      <ToggleRow
                        title="Two-factor authentication"
                        description="Require an additional authentication step when signing in."
                        enabled={security.twoFactor}
                        onChange={() =>
                          setSecurity({
                            ...security,
                            twoFactor: !security.twoFactor,
                          })
                        }
                      />

                    </div>

                    <div className="mt-6 max-w-sm">

                      <FormField label="Session Timeout">

                        <select
                          value={security.sessionTimeout}
                          onChange={(event) =>
                            setSecurity({
                              ...security,
                              sessionTimeout:
                                event.target.value,
                            })
                          }
                          className="input"
                        >
                          <option value="15">
                            15 minutes
                          </option>

                          <option value="30">
                            30 minutes
                          </option>

                          <option value="60">
                            1 hour
                          </option>

                          <option value="120">
                            2 hours
                          </option>
                        </select>

                      </FormField>

                    </div>

                    <SaveButton
                      onClick={handleSave}
                      saved={saved}
                    />

                  </SettingsCard>

                )}

                {/* AI */}
                {activeSection === "ai" && (

                  <SettingsCard
                    title="AI Preferences"
                    description="Control how the AI-assisted configuration analysis behaves."
                  >

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

                      <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                          <FaBrain />
                        </div>

                        <div>

                          <h3 className="text-sm font-bold text-blue-900">
                            AI Confidence Threshold
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-blue-700">
                            The system can use confidence scores to determine which mappings should be automatically suggested.
                          </p>

                        </div>

                      </div>

                      <div className="mt-6">

                        <div className="flex items-center justify-between">

                          <span className="text-sm font-semibold text-blue-900">
                            Confidence threshold
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-blue-700 shadow-sm">
                            {aiSettings.confidenceThreshold}%
                          </span>

                        </div>

                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={aiSettings.confidenceThreshold}
                          onChange={(event) =>
                            setAiSettings({
                              ...aiSettings,
                              confidenceThreshold:
                                Number(event.target.value),
                            })
                          }
                          className="mt-5 w-full accent-blue-600"
                        />

                        <div className="mt-2 flex justify-between text-xs text-blue-500">

                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>

                        </div>

                      </div>

                    </div>

                    <div className="mt-5 space-y-1">

                      <ToggleRow
                        title="Automatic mapping suggestions"
                        description="Allow the AI to suggest mappings for unfamiliar configuration patterns."
                        enabled={aiSettings.autoMapping}
                        onChange={() =>
                          setAiSettings({
                            ...aiSettings,
                            autoMapping:
                              !aiSettings.autoMapping,
                          })
                        }
                      />

                      <ToggleRow
                        title="Require human approval"
                        description="Keep administrator approval required before a learned mapping is accepted."
                        enabled={aiSettings.requireHumanApproval}
                        onChange={() =>
                          setAiSettings({
                            ...aiSettings,
                            requireHumanApproval:
                              !aiSettings.requireHumanApproval,
                          })
                        }
                      />

                    </div>

                    <SaveButton
                      onClick={handleSave}
                      saved={saved}
                    />

                  </SettingsCard>

                )}

              </div>

            </section>

          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function SettingsNav({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${active ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function SettingsCard({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="border-b border-slate-100 pb-6">

        <h3 className="text-lg font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>

      </div>

      <div className="pt-6">
        {children}
      </div>

    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {children}

    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-100 py-5 last:border-0">

      <div>

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>

      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "bg-blue-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${enabled ? "left-6" : "left-1"}`}
        ></span>
      </button>

    </div>
  );
}

function PasswordField({
  label,
  value,
  visible,
  onChange,
  onToggle,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="input pr-11"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>

      </div>

    </div>
  );
}

function SaveButton({ onClick, saved }) {
  return (
    <div className="mt-7 flex items-center gap-3">

      <button
        onClick={onClick}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        {saved ? <FaCheckCircle /> : <FaSave />}
        {saved ? "Saved" : "Save Changes"}
      </button>

      {saved && (
        <span className="text-sm font-medium text-emerald-600">
          Changes saved successfully.
        </span>
      )}

    </div>
  );
}

export default Settings;