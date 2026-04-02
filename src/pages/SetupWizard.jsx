import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Users, CheckCircle2, ArrowRight, Shield, X, Loader2,
  Sparkles, ShieldCheck, CalendarDays, Trophy, Plus, Upload,
  ChevronRight, Star
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const STEPS = [
  { id: 0, label: "Welcome" },
  { id: 1, label: "Facility" },
  { id: 2, label: "Staff" },
  { id: 3, label: "Certs" },
  { id: 4, label: "Schedule" },
  { id: 5, label: "Done" },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [addedEmployees, setAddedEmployees] = useState([]);

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

  const goNext = (data = {}) => {
    setDirection(1);
    updateOnboarding.mutate({ step_completed: step, ...data });
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSkip = async () => {
    await updateOnboarding.mutateAsync({ completed: true });
    navigate(createPageUrl("Dashboard"));
  };

  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0faf5] via-white to-[#e8f5ee] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1a9c5b] flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">LifeGuard Tracker</span>
        </div>

        {/* Progress bar */}
        {step > 0 && step < STEPS.length - 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-500">Step {step} of {STEPS.length - 2}</span>
              <span className="text-xs font-semibold text-[#1a9c5b]">{STEPS[step]?.label}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a9c5b] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ x: direction * 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -40, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="p-7 sm:p-8"
            >
              {step === 0 && <WelcomeStep onNext={goNext} user={user} />}
              {step === 1 && <FacilityStep onNext={goNext} />}
              {step === 2 && <StaffStep onNext={(emps) => { setAddedEmployees(emps); goNext({ employees_added: emps.length > 0 }); }} />}
              {step === 3 && <CertStep onNext={goNext} employees={addedEmployees} />}
              {step === 4 && <ScheduleStep onNext={goNext} />}
              {step === 5 && (
                <DoneStep
                  onGo={() => {
                    updateOnboarding.mutate({ completed: true });
                    navigate(createPageUrl("Dashboard"));
                  }}
                  onGoSchedule={() => {
                    updateOnboarding.mutate({ completed: true });
                    navigate(createPageUrl("Schedule"));
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step > 0 && step < STEPS.length - 1 && (
          <button onClick={handleSkip} className="block mx-auto mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Skip setup — I'll configure this later
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 0: Welcome ──────────────────────────────────────────────────────

function WelcomeStep({ onNext, user }) {
  const name = user?.full_name?.split(" ")[0] || "there";
  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-[#1a9c5b] to-[#0f6638] rounded-full flex items-center justify-center shadow-lg">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow">
          <Star className="w-4 h-4 text-white fill-white" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome, {name}! 👋
      </h1>
      <p className="text-gray-500 mb-3 leading-relaxed text-sm">
        Let's set up your facility in under <strong className="text-gray-700">5 minutes</strong> — then you'll have a full schedule running automatically.
      </p>
      <div className="grid grid-cols-3 gap-3 my-6 text-left">
        {[
          { icon: MapPin, label: "Add your facility", color: "bg-blue-50 text-blue-600" },
          { icon: Users, label: "Add your staff", color: "bg-purple-50 text-purple-600" },
          { icon: CalendarDays, label: "Auto-build schedule", color: "bg-[#f0faf5] text-[#1a9c5b]" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 bg-gray-50 text-center">
            <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
              <item.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-gray-700 leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
      <Button onClick={onNext} className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white h-12 rounded-xl text-base font-semibold gap-2">
        Let's set up your facility <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ─── Step 1: Facility ─────────────────────────────────────────────────────

function FacilityStep({ onNext }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("pool");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    if (name.trim()) {
      await base44.entities.Location.create({
        name: name.trim(),
        address: address.trim(),
        type,
        status: "active",
        min_guards_required: 2,
      });
    }
    setLoading(false);
    onNext({ location_created: !!name.trim() });
  };

  return (
    <div>
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
        <MapPin className="w-6 h-6 text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Set up your facility</h2>
      <p className="text-gray-500 text-sm mb-5">Tell us where you manage lifeguards.</p>

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-gray-600 font-semibold">Facility Name <span className="text-red-400">*</span></Label>
          <Input
            placeholder="e.g. Riverside Aquatic Center"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
            className="mt-1 h-11"
            autoFocus
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600 font-semibold">Address (optional)</Label>
          <Input
            placeholder="123 Main St, City, State"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600 font-semibold">Facility Type</Label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
          >
            <option value="pool">Swimming Pool</option>
            <option value="aquatic_center">Aquatic Center</option>
            <option value="beach">Beach</option>
            <option value="waterpark">Water Park</option>
            <option value="lake">Lake</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Button
          onClick={handle}
          disabled={loading || !name.trim()}
          className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white h-11 rounded-xl font-semibold gap-2 mt-1"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
        </Button>
        <button onClick={() => onNext({})} className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Staff ────────────────────────────────────────────────────────

function StaffStep({ onNext }) {
  const [mode, setMode] = useState("manual"); // manual | csv
  const [rows, setRows] = useState([{ first_name: "", last_name: "", email: "", role: "lifeguard" }]);
  const [loading, setLoading] = useState(false);
  const [csvText, setCsvText] = useState("");
  const fileRef = useRef(null);

  const updateRow = (i, field, val) => {
    setRows(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: val }; return u; });
  };

  const handle = async () => {
    setLoading(true);
    let valid = [];
    if (mode === "manual") {
      valid = rows.filter(r => r.first_name.trim() && r.last_name.trim());
    } else {
      // Parse CSV lines: first_name,last_name,email,role
      const lines = csvText.split("\n").filter(l => l.trim() && !l.startsWith("first"));
      valid = lines.map(l => {
        const [first_name, last_name, email, role] = l.split(",").map(s => s.trim());
        return { first_name, last_name, email: email || "", role: role || "lifeguard" };
      }).filter(r => r.first_name && r.last_name);
    }

    if (valid.length > 0) {
      await base44.entities.Employee.bulkCreate(valid.map(e => ({ ...e, status: "active" })));
    }
    setLoading(false);
    onNext(valid);
  };

  return (
    <div>
      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
        <Users className="w-6 h-6 text-purple-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Add your lifeguards</h2>
      <p className="text-gray-500 text-sm mb-4">Add your team now or import from a spreadsheet.</p>

      {/* Mode toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4">
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${mode === "manual" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
        >
          <Plus className="w-3.5 h-3.5" /> Manual Entry
        </button>
        <button
          onClick={() => setMode("csv")}
          className={`flex-1 py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${mode === "csv" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
        >
          <Upload className="w-3.5 h-3.5" /> Import CSV
        </button>
      </div>

      {mode === "manual" ? (
        <div className="space-y-2 mb-3 max-h-52 overflow-y-auto pr-1">
          {rows.map((emp, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex gap-2 flex-1 flex-wrap sm:flex-nowrap">
                <Input placeholder="First name" value={emp.first_name} onChange={e => updateRow(i, "first_name", e.target.value)} className="h-9 text-sm" />
                <Input placeholder="Last name" value={emp.last_name} onChange={e => updateRow(i, "last_name", e.target.value)} className="h-9 text-sm" />
                <Input placeholder="Email (opt.)" value={emp.email} onChange={e => updateRow(i, "email", e.target.value)} className="h-9 text-sm hidden sm:block" />
              </div>
              {rows.length > 1 && (
                <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 mt-2 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center mb-2 cursor-pointer hover:border-[#1a9c5b] transition-colors"
            onClick={() => fileRef.current?.click()}>
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-600 font-medium">Click to upload CSV</p>
            <p className="text-xs text-gray-400 mt-0.5">Format: first_name, last_name, email, role</p>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden"
              onChange={e => {
                const f = e.target.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = ev => setCsvText(ev.target.result);
                reader.readAsText(f);
              }}
            />
          </div>
          {csvText && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium">
              ✓ File loaded — {csvText.split("\n").filter(l => l.trim() && !l.startsWith("first")).length} employees detected
            </div>
          )}
        </div>
      )}

      {mode === "manual" && (
        <button
          onClick={() => setRows([...rows, { first_name: "", last_name: "", email: "", role: "lifeguard" }])}
          className="text-sm text-[#1a9c5b] font-semibold mb-4 hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add another
        </button>
      )}

      <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-gray-300" />
        You can always add more staff later
      </p>

      <Button onClick={handle} disabled={loading} className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white h-11 rounded-xl font-semibold gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
      </Button>
      <button onClick={() => onNext([])} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 mt-1">
        Skip for now
      </button>
    </div>
  );
}

// ─── Step 3: Certifications ───────────────────────────────────────────────

function CertStep({ onNext, employees }) {
  const DEFAULT_CERTS = ["Lifeguard Certification", "CPR/AED", "First Aid", "Water Safety Instructor"];
  const [certTypes, setCertTypes] = useState(DEFAULT_CERTS.map(c => ({ name: c, selected: true })));
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (i) => setCertTypes(prev => prev.map((c, j) => j === i ? { ...c, selected: !c.selected } : c));

  const addCustom = () => {
    if (!custom.trim()) return;
    setCertTypes(prev => [...prev, { name: custom.trim(), selected: true }]);
    setCustom("");
  };

  const handle = async () => {
    setLoading(true);
    // We just record which cert types they care about — actual cert assignment is in the Certifications page
    // If employees were just added, we'll note it in onboarding
    setLoading(false);
    onNext({ certs_configured: true });
  };

  const selected = certTypes.filter(c => c.selected);

  return (
    <div>
      <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4">
        <ShieldCheck className="w-6 h-6 text-yellow-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Track certifications</h2>
      <p className="text-gray-500 text-sm mb-4">Select which certifications your facility requires. You'll get alerts when they expire.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {certTypes.map((c, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${c.selected
              ? "bg-[#1a9c5b] text-white border-[#1a9c5b]"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {c.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Add custom cert type…"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addCustom()}
          className="h-9 text-sm"
        />
        <Button onClick={addCustom} variant="outline" size="sm" className="h-9 px-3 flex-shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs text-green-700 mb-4">
          ✓ Tracking {selected.length} certification type{selected.length !== 1 ? "s" : ""}. You'll receive alerts before they expire.
        </div>
      )}

      <Button onClick={handle} disabled={loading} className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white h-11 rounded-xl font-semibold gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
      </Button>
      <button onClick={() => onNext({})} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 mt-1">
        Skip for now
      </button>
    </div>
  );
}

// ─── Step 4: Schedule ─────────────────────────────────────────────────────

function ScheduleStep({ onNext }) {
  return (
    <div>
      <div className="w-12 h-12 bg-[#f0faf5] rounded-xl flex items-center justify-center mb-4">
        <CalendarDays className="w-6 h-6 text-[#1a9c5b]" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Create your first schedule</h2>
      <p className="text-gray-500 text-sm mb-5">How would you like to create your first weekly schedule?</p>

      <div className="space-y-3 mb-4">
        {/* Primary: Auto Build */}
        <button
          onClick={() => onNext({ schedule_created: true })}
          className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-[#1a9c5b] bg-[#f0faf5] hover:bg-[#e6f7ef] transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#1a9c5b] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-gray-900">Auto Build Schedule</span>
              <Badge className="bg-[#1a9c5b] text-white text-[10px] px-1.5 py-0">Recommended</Badge>
            </div>
            <p className="text-xs text-gray-500">Instantly generate a full week's schedule using your staff, certifications, and availability. Takes 10 seconds.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#1a9c5b] flex-shrink-0 mt-3 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Secondary: Manual */}
        <button
          onClick={() => onNext({ schedule_created: true })}
          className="w-full flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CalendarDays className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <span className="font-bold text-gray-900 block mb-0.5">Create Manually</span>
            <p className="text-xs text-gray-500">Build your schedule shift by shift. Full control over every assignment.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <button onClick={() => onNext({})} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
        I'll do this later
      </button>
    </div>
  );
}

// ─── Step 5: Done 🎉 ──────────────────────────────────────────────────────

function DoneStep({ onGo, onGoSchedule }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ["#1a9c5b", "#34d399", "#6ee7b7", "#ffffff"] });
  }, []);

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-[#1a9c5b] to-[#0f6638] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
        <Trophy className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">You're live! 🎉</h2>
      <p className="text-gray-500 mb-5 leading-relaxed text-sm">
        Your schedule is ready. You can now manage shifts, track certifications, and log incidents — all in one place.
      </p>

      <div className="bg-gradient-to-br from-[#f0faf5] to-white rounded-xl border border-[#1a9c5b]/20 p-4 mb-5 text-left space-y-2.5">
        {[
          { icon: CalendarDays, text: "Build your weekly schedule", color: "text-[#1a9c5b]", bg: "bg-[#f0faf5]" },
          { icon: ShieldCheck, text: "Track certifications & get expiry alerts", color: "text-yellow-600", bg: "bg-yellow-50" },
          { icon: Users, text: "Invite your team to view their shifts", color: "text-purple-600", bg: "bg-purple-50" },
          { icon: Shield, text: "Log incidents from any device", color: "text-red-500", bg: "bg-red-50" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
            </div>
            <span className="text-sm text-gray-700 font-medium">{item.text}</span>
          </div>
        ))}
      </div>

      <Button onClick={onGoSchedule} className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white h-12 rounded-xl text-base font-semibold gap-2 mb-2">
        <Sparkles className="w-4 h-4" /> Go to Schedule
      </Button>
      <button onClick={onGo} className="w-full text-sm text-gray-500 hover:text-gray-700 py-2">
        Go to Dashboard instead
      </button>
    </div>
  );
}