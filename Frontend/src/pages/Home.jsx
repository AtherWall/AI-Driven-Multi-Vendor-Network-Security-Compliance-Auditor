import React, { useState } from "react";
import { FaShieldAlt, FaNetworkWired, FaBrain, FaFileAlt, FaArrowRight, FaCheckCircle, FaTimes, FaBars, FaLock, FaServer, FaChartLine } from "react-icons/fa";

function Home({ setuser }) {
  const [authMode, setAuthMode] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      return;
    }

    // Temporary frontend login.
    // Replace this with your backend authentication API later.
    setuser({
      name: loginData.email.split("@")[0],
      email: loginData.email,
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Temporary frontend signup.
    // Replace this with your backend authentication API later.
    setuser({
      name: signupData.name,
      email: signupData.email,
    });
  };

  const scrollToSection = (id) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">

      {/* Navbar */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <FaShieldAlt className="text-xl" />
            </div>

            <div className="text-left">
              <h1 className="text-sm font-bold leading-tight">AI Network Security</h1>
              <p className="text-sm font-bold leading-tight text-blue-400">Auditor</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={() => scrollToSection("features")} className="text-sm text-slate-300 transition hover:text-white">Features</button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-sm text-slate-300 transition hover:text-white">How It Works</button>
            <button onClick={() => scrollToSection("frameworks")} className="text-sm text-slate-300 transition hover:text-white">Frameworks</button>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => setAuthMode("login")} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5">
              Login
            </button>

            <button onClick={() => setAuthMode("signup")} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="rounded-lg p-2 text-slate-200 md:hidden">
            {mobileMenu ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="border-t border-white/10 bg-slate-950 px-6 py-5 md:hidden">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollToSection("features")} className="text-left text-sm text-slate-300">Features</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-left text-sm text-slate-300">How It Works</button>
              <button onClick={() => scrollToSection("frameworks")} className="text-left text-sm text-slate-300">Frameworks</button>

              <div className="mt-2 flex gap-3 border-t border-white/10 pt-4">
                <button onClick={() => { setAuthMode("login"); setMobileMenu(false); }} className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold">
                  Login
                </button>

                <button onClick={() => { setAuthMode("signup"); setMobileMenu(false); }} className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pb-20 pt-32 lg:px-8">

        {/* Background glow */}
        <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute -right-32 top-1/2 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl"></div>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">

          {/* Hero text */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></span>
              AI-Powered Network Security
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Secure Every Device.
              <span className="mt-2 block text-blue-500">Audit Every Configuration.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
              Analyze network configurations across vendors, identify security weaknesses, evaluate compliance, and get actionable remediation recommendations from one platform.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <button onClick={() => setAuthMode("signup")} className="group flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-semibold shadow-xl shadow-blue-600/20 transition hover:bg-blue-500">
                Start Auditing
                <FaArrowRight className="transition group-hover:translate-x-1" />
              </button>

              <button onClick={() => scrollToSection("how-it-works")} className="rounded-xl border border-white/10 bg-white/5 px-7 py-4 font-semibold text-slate-200 transition hover:bg-white/10">
                See How It Works
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" />
                Multi-vendor support
              </div>

              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" />
                AI-assisted analysis
              </div>

              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" />
                Actionable remediation
              </div>
            </div>
          </div>

          {/* Hero dashboard preview */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-blue-600/10 blur-2xl"></div>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">

              {/* Preview header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>

                <span className="text-xs text-slate-500">Security Dashboard</span>
              </div>

              <div className="p-5">
                <div className="mb-5">
                  <p className="text-xs text-slate-500">Network Compliance</p>
                  <div className="mt-2 flex items-end justify-between">
                    <h3 className="text-4xl font-bold">87%</h3>
                    <span className="text-sm text-emerald-400">+12.4%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <FaShieldAlt className="text-blue-400" />
                    <p className="mt-3 text-2xl font-bold">24</p>
                    <p className="text-xs text-slate-500">Devices</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <FaCheckCircle className="text-emerald-400" />
                    <p className="mt-3 text-2xl font-bold">18</p>
                    <p className="text-xs text-slate-500">Compliant</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <FaLock className="text-red-400" />
                    <p className="mt-3 text-2xl font-bold">06</p>
                    <p className="text-xs text-slate-500">Issues</p>
                  </div>
                </div>

                {/* Fake graph */}
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Network Topology</p>
                    <span className="text-xs text-emerald-400">Live</span>
                  </div>

                  <div className="relative mt-6 h-40">
                    <div className="absolute left-1/2 top-2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10 text-blue-400">
                      <FaNetworkWired />
                    </div>

                    <div className="absolute left-1/2 top-14 h-12 w-px -translate-x-1/2 bg-blue-500/40"></div>

                    <div className="absolute left-[18%] top-24 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-400">
                      <FaServer />
                    </div>

                    <div className="absolute left-1/2 top-24 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-400">
                      <FaServer />
                    </div>

                    <div className="absolute right-[18%] top-24 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10 text-purple-400">
                      <FaServer />
                    </div>

                    <div className="absolute left-1/2 top-[82px] h-px w-[65%] -translate-x-1/2 bg-blue-500/30"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trusted / Vendors */}
      <section id="frameworks" className="border-y border-white/5 bg-slate-900/50 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Built for heterogeneous networks</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {["Cisco", "Palo Alto", "Fortinet", "Juniper", "Arista", "AWS", "Azure", "SONiC"].map((vendor) => (
              <div key={vendor} className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300">
                {vendor}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <span>CIS Benchmarks</span>
            <span>•</span>
            <span>NIST SP 800-53</span>
            <span>•</span>
            <span>DISA STIGs</span>
            <span>•</span>
            <span>ISO/IEC 27001</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Powerful Features</span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Everything you need to secure your network</h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">A centralized security platform designed to make multi-vendor network auditing faster, smarter, and easier to understand.</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            <FeatureCard icon={<FaUploadIcon />} title="Unified Configuration Ingestion" description="Upload configurations from firewalls, routers, switches, cloud environments, and other network devices from one centralized platform." />

            <FeatureCard icon={<FaBrain />} title="AI-Powered Analysis" description="Use AI-assisted pattern recognition to understand configuration structures and identify security-related settings across different vendors." />

            <FeatureCard icon={<FaShieldAlt />} title="Multi-Framework Compliance" description="Evaluate network configurations against security frameworks such as CIS, NIST, DISA STIGs, and ISO/IEC 27001." />

            <FeatureCard icon={<FaNetworkWired />} title="Network Topology" description="Visualize devices and their relationships to understand how your network infrastructure is connected." />

            <FeatureCard icon={<FaChartLine />} title="Risk & Compliance Insights" description="See compliance status, security gaps, severity levels, and areas that require administrator attention." />

            <FeatureCard icon={<FaFileAlt />} title="Actionable Reports" description="Generate detailed reports with device information, compliance findings, risk severity, and remediation recommendations." />

          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-white/5 bg-slate-900/50 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">How It Works</span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">From configuration to remediation</h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">A simple workflow for turning raw network configurations into useful security insights.</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <StepCard number="01" icon={<FaUploadIcon />} title="Upload" description="Upload a device configuration file to the platform." />

            <StepCard number="02" icon={<FaBrain />} title="Analyze" description="The system processes and normalizes the configuration." />

            <StepCard number="03" icon={<FaShieldAlt />} title="Audit" description="Evaluate the configuration against security requirements." />

            <StepCard number="04" icon={<FaArrowRight />} title="Remediate" description="Get clear recommendations to fix identified issues." />

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-500/20 bg-blue-600/10 p-10 text-center sm:p-16">

          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl"></div>

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/30">
              <FaShieldAlt className="text-2xl" />
            </div>

            <h2 className="mt-7 text-4xl font-bold sm:text-5xl">Ready to secure your network?</h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              Start analyzing your network configurations and discover security weaknesses before they become problems.
            </p>

            <button onClick={() => setAuthMode("signup")} className="mt-8 inline-flex items-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-semibold shadow-xl shadow-blue-600/20 transition hover:bg-blue-500">
              Get Started
              <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <FaShieldAlt className="text-sm" />
            </div>

            <div>
              <p className="text-sm font-semibold">AI Network Security Auditor</p>
              <p className="text-xs text-slate-500">Intelligent security for modern networks</p>
            </div>
          </div>

          <p className="text-xs text-slate-600">© 2026 AI Network Security Auditor. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {authMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md">

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">

            <button onClick={() => setAuthMode(null)} className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white">
              <FaTimes />
            </button>

            <div className="p-7 sm:p-8">

              <div className="mb-7 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
                  <FaShieldAlt className="text-xl" />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-white">
                  {authMode === "login" ? "Welcome Back" : "Create Your Account"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {authMode === "login" ? "Sign in to access your security dashboard." : "Create an account and start auditing your network."}
                </p>
              </div>

              {authMode === "login" ? (
                <form onSubmit={handleLogin} className="space-y-5">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                    <input type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                    <input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} placeholder="Enter your password" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500" />
                  </div>

                  <button type="submit" className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500">
                    Login
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setAuthMode("signup")} className="font-semibold text-blue-400 hover:text-blue-300">
                      Sign up
                    </button>
                  </p>

                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
                    <input type="text" value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} placeholder="Your name" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                    <input type="email" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                    <input type="password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} placeholder="Create a password" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Confirm Password</label>
                    <input type="password" value={signupData.confirmPassword} onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })} placeholder="Confirm your password" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500" />
                  </div>

                  <button type="submit" className="mt-2 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500">
                    Create Account
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setAuthMode("login")} className="font-semibold text-blue-400 hover:text-blue-300">
                      Login
                    </button>
                  </p>

                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-blue-500/[0.04]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400 transition group-hover:bg-blue-500/20">
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-bold text-white">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}

function StepCard({ number, icon, title, description }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-950 p-7">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-blue-500">{number}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>
      </div>

      <h3 className="mt-7 text-xl font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}

function FaUploadIcon() {
  return <span className="text-xl">↥</span>;
}

export default Home;