import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Settings, CheckCircle2, ArrowRight, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const steps = [
  { id: 0, title: "Welcome", icon: null },
  { id: 1, title: "Add Location", icon: MapPin },
  { id: 2, title: "Add Employees", icon: Users },
  { id: 3, title: "Configure Settings", icon: Settings },
  { id: 4, title: "Complete", icon: CheckCircle2 },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);

  // Fetch user
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate("/"));
  }, [navigate]);

  // Fetch onboarding status
  const { data: onboarding } = useQuery({
    queryKey: ["onboarding"],
    queryFn: async () => {
      if (!user?.email) return null;
      const results = await base44.entities.OnboardingStatus.filter({
        user_email: user.email,
      });
      return results[0] || null;
    },
    enabled: !!user?.email,
  });

  const updateOnboarding = useMutation({
    mutationFn: async (updates) => {
      if (onboarding?.id) {
        return base44.entities.OnboardingStatus.update(onboarding.id, updates);
      } else {
        return base44.entities.OnboardingStatus.create({
          user_email: user.email,
          ...updates,
        });
      }
    },
  });

  const handleNext = async () => {
    if (currentStep === 1) {
      await updateOnboarding.mutate({ location_created: true });
    } else if (currentStep === 2) {
      await updateOnboarding.mutate({ employees_added: true });
    } else if (currentStep === 3) {
      await updateOnboarding.mutate({
        settings_configured: true,
        completed: true,
      });
    }
    setCurrentStep(Math.min(currentStep + 1, 4));
  };

  const handleSkip = async () => {
    await updateOnboarding.mutate({ completed: true });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to ShiftGuard</h1>
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex gap-2">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  idx <= currentStep ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <Card className="p-12">
          {currentStep === 0 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Let's get you started
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We'll walk you through setting up your team, locations, and preferences.
                This should take just 5 minutes.
              </p>
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 rounded-lg"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                onClick={handleSkip}
                className="block mt-4 text-gray-600 hover:text-gray-900 text-sm"
              >
                Skip for now
              </button>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add Your First Location
              </h2>
              <p className="text-gray-600 mb-6">
                Where do you manage lifeguards? (e.g., Main Pool, Beach Area)
              </p>
              <LocationStep onComplete={handleNext} />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add Your Team
              </h2>
              <p className="text-gray-600 mb-6">
                Start by adding a few team members. You can add more anytime.
              </p>
              <EmployeesStep onComplete={handleNext} />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Preferences
              </h2>
              <p className="text-gray-600 mb-6">
                Configure your basic settings to personalize your experience.
              </p>
              <SettingsStep onComplete={handleNext} />
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You're all set!
              </h2>
              <p className="text-gray-600 mb-8">
                Your account is ready to go. Start managing your team now.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 rounded-lg"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function LocationStep({ onComplete }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const user = React.useRef(null);

  React.useEffect(() => {
    base44.auth.me().then((u) => (user.current = u));
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await base44.entities.Location.create({
      name: name.trim(),
      type: "pool",
      min_guards_required: 1,
    });
    onComplete();
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="e.g., Main Pool"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
      />
      <div className="flex gap-3">
        <Button
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
        >
          {loading ? "Creating..." : "Create Location"}
        </Button>
        <Button
          variant="outline"
          onClick={onComplete}
          className="flex-1"
        >
          Skip
        </Button>
      </div>
    </div>
  );
}

function EmployeesStep({ onComplete }) {
  const [employees, setEmployees] = useState([{ first_name: "", last_name: "" }]);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setEmployees([...employees, { first_name: "", last_name: "" }]);
  };

  const handleChange = (idx, field, value) => {
    const updated = [...employees];
    updated[idx][field] = value;
    setEmployees(updated);
  };

  const handleCreate = async () => {
    const valid = employees.filter((e) => e.first_name.trim() && e.last_name.trim());
    if (valid.length === 0) return;

    setLoading(true);
    await base44.entities.Employee.bulkCreate(valid);
    onComplete();
  };

  return (
    <div className="space-y-4">
      {employees.map((emp, idx) => (
        <div key={idx} className="flex gap-3">
          <Input
            placeholder="First name"
            value={emp.first_name}
            onChange={(e) => handleChange(idx, "first_name", e.target.value)}
          />
          <Input
            placeholder="Last name"
            value={emp.last_name}
            onChange={(e) => handleChange(idx, "last_name", e.target.value)}
          />
        </div>
      ))}
      <Button
        variant="outline"
        onClick={handleAdd}
        className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
      >
        + Add another
      </Button>
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
        >
          {loading ? "Adding..." : "Add Team Members"}
        </Button>
        <Button
          variant="outline"
          onClick={onComplete}
          className="flex-1"
        >
          Skip
        </Button>
      </div>
    </div>
  );
}

function SettingsStep({ onComplete }) {
  const [settings, setSettings] = useState({
    shift_duration: "8",
    start_time: "08:00",
  });

  const handleSave = async () => {
    const user = await base44.auth.me();
    await base44.auth.updateMe({ onboarding_settings: settings });
    onComplete();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Shift Duration (hours)
        </label>
        <Input
          type="number"
          min="1"
          max="24"
          value={settings.shift_duration}
          onChange={(e) =>
            setSettings({ ...settings, shift_duration: e.target.value })
          }
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Start Time
        </label>
        <Input
          type="time"
          value={settings.start_time}
          onChange={(e) =>
            setSettings({ ...settings, start_time: e.target.value })
          }
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
        >
          Save Settings
        </Button>
        <Button
          variant="outline"
          onClick={onComplete}
          className="flex-1"
        >
          Skip
        </Button>
      </div>
    </div>
  );
}