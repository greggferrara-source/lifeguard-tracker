import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Users, CheckCircle2, ArrowRight, Shield, X, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 0, title: "Welcome" },
  { id: 1, title: "Location" },
  { id: 2, title: "Team" },
  { id: 3, title: "Done" },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate(createPageUrl("Dashboard")));
  }, [navigate]);

  const { data: onboarding } = useQuery({
    queryKey: ["onboarding"],
    queryFn: async () => {
      if (!user?.email) return null;
      const results = await base44.entities.OnboardingStatus.filter({ user_email: user.email });
      return results[0] || null;
    },
    enabled: !!user?.email,
  });

  const updateOnboarding = useMutation({
    mutationFn: async (updates) => {
      if (onboarding?.id) return base44.entities.OnboardingStatus.update(onboarding.id, updates);
      return base44.entities.OnboardingStatus.create({ user_email: user?.email, ...updates });
    },
  });

  const handleSkip = async () => {
    await updateOnboarding.mutateAsync({ completed: true });
    navigate(createPageUrl("Dashboard"));
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0faf5] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1a9c5b] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">LifeGuard Tracker</span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-[#1a9c5b]" : i < step ? "w-2 bg-[#1a9c5b]/40" : "w-2 bg-gray-200"}`} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              {step === 0 && <WelcomeStep onNext={next} onSkip={handleSkip} user={user} />}
              {step === 1 && <LocationStep onNext={next} />}
              {step === 2 && <EmployeesStep onNext={async () => { await updateOnboarding.mutateAsync({ employees_added: true }); next(); }} />}
              {step === 3 && <DoneStep onGo={() => { updateOnboarding.mutate({ completed: true }); navigate(createPageUrl("Dashboard")); }} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {step < 3 && (
          <button onClick={handleSkip} className="block mx-auto mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Skip setup for now
          </button>
        )}
      </div>
    </div>
  );
}

function WelcomeStep({ onNext, user }) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-[#f0faf5] rounded-full flex items-center justify-center mx-auto mb-6">
        <Shield className="w-10 h-10 text-[#1a9c5b]" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}!</h1>
      <p className="text-gray-500 mb-8 leading-relaxed">Let's get your facility set up in just 2 quick steps. You'll be scheduling shifts in under 5 minutes.</p>
      <Button onClick={onNext} className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white h-12 rounded-xl text-base font-semibold">
        Get Started <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function LocationStep({ onNext }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("pool");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { onNext(); return; }
    setLoading(true);
    await base44.entities.Location.create({ name: name.trim(), type, status: "active", min_guards_required: 1 });
    onNext();
  };

  return (
    <div>
      <div className="w-12 h-12 bg-[#f0faf5] rounded-xl flex items-center justify-center mb-4">
        <MapPin className="w-6 h-6 text-[#1a9c5b]" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Add your first location</h2>
      <p className="text-gray-500 text-sm mb-6">Where do you manage lifeguards? (e.g., Main Pool, Beach Zone A)</p>
      <div className="space-y-3">
        <Input
          placeholder="Location name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="h-11"
          autoFocus
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
        >
          <option value="pool">Swimming Pool</option>
          <option value="beach">Beach</option>
          <option value="waterpark">Water Park</option>
          <option value="lake">Lake</option>
          <option value="other">Other</option>
        </select>
        <Button onClick={handleCreate} disabled={loading} className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white h-11 rounded-xl font-semibold">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Location"}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
        <button onClick={onNext} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">Skip this step</button>
      </div>
    </div>
  );
}

function EmployeesStep({ onNext }) {
  const [employees, setEmployees] = useState([{ first_name: "", last_name: "", role: "lifeguard" }]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const valid = employees.filter((e) => e.first_name.trim() && e.last_name.trim());
    if (valid.length === 0) { onNext(); return; }
    setLoading(true);
    await base44.entities.Employee.bulkCreate(valid.map((e) => ({ ...e, status: "active" })));
    onNext();
  };

  return (
    <div>
      <div className="w-12 h-12 bg-[#f0faf5] rounded-xl flex items-center justify-center mb-4">
        <Users className="w-6 h-6 text-[#1a9c5b]" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Add your team</h2>
      <p className="text-gray-500 text-sm mb-6">Add a few team members to get started. You can always add more later.</p>
      <div className="space-y-2 mb-3">
        {employees.map((emp, i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="First name" value={emp.first_name} onChange={(e) => { const u = [...employees]; u[i].first_name = e.target.value; setEmployees(u); }} className="h-10" />
            <Input placeholder="Last name" value={emp.last_name} onChange={(e) => { const u = [...employees]; u[i].last_name = e.target.value; setEmployees(u); }} className="h-10" />
            {employees.length > 1 && (
              <button onClick={() => setEmployees(employees.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 px-1">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => setEmployees([...employees, { first_name: "", last_name: "", role: "lifeguard" }])} className="text-sm text-[#1a9c5b] font-medium mb-4 hover:underline">
        + Add another
      </button>
      <Button onClick={handleCreate} disabled={loading} className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white h-11 rounded-xl font-semibold">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Team Members"}
        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
      <button onClick={onNext} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 mt-1">Skip this step</button>
    </div>
  );
}

function DoneStep({ onGo }) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-[#f0faf5] rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-[#1a9c5b]" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set! 🎉</h2>
      <p className="text-gray-500 mb-4 leading-relaxed">Your account is ready. Here's what to do next:</p>
      <ul className="text-left space-y-2 mb-8 bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1a9c5b] flex-shrink-0" /> Set up your schedule on the Schedule page</li>
        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1a9c5b] flex-shrink-0" /> Invite your team via Settings → Invite Employees</li>
        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1a9c5b] flex-shrink-0" /> Check Docs for tips and tutorials</li>
      </ul>
      <Button onClick={onGo} className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white h-12 rounded-xl text-base font-semibold">
        Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}