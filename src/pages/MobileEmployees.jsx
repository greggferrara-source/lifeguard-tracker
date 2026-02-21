import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Mail, Phone, ChevronRight } from "lucide-react";
import EmployeeDialog from "@/components/employees/EmployeeDialog";
import EmployeeProfile from "@/components/employees/EmployeeProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const roleLabels = { lifeguard: "Lifeguard", head_lifeguard: "Head LG", supervisor: "Supervisor", manager: "Manager" };
const statusDot = { active: "bg-emerald-400", inactive: "bg-gray-300", on_leave: "bg-amber-400" };

function haptic() { if (navigator.vibrate) navigator.vibrate(8); }

export default function MobileEmployees() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => base44.entities.Employee.list() });
  const { data: shifts = [] } = useQuery({ queryKey: ["shifts"], queryFn: () => base44.entities.Shift.list("-created_date", 500) });

  const createEmployee = useMutation({ mutationFn: (data) => base44.entities.Employee.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); setDialogOpen(false); } });
  const updateEmployee = useMutation({ mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); setDialogOpen(false); } });
  const deleteEmployee = useMutation({ mutationFn: (id) => base44.entities.Employee.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }) });

  const filtered = useMemo(() => {
    if (!search) return employees;
    const q = search.toLowerCase();
    return employees.filter((e) => `${e.first_name} ${e.last_name} ${e.email || ""} ${e.phone || ""}`.toLowerCase().includes(q));
  }, [employees, search]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((e) => {
      const letter = (e.first_name?.[0] || "#").toUpperCase();
      if (!g[letter]) g[letter] = [];
      g[letter].push(e);
    });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleSave = (formData) => {
    if (editingEmployee) updateEmployee.mutate({ id: editingEmployee.id, data: formData });
    else createEmployee.mutate(formData);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      {/* Sticky Search Header */}
      <div className="bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Team</h1>
            <p className="text-sm text-gray-400">{employees.length} members</p>
          </div>
          <button
            onClick={() => { haptic(); setEditingEmployee(null); setDialogOpen(true); }}
            className="w-11 h-11 bg-[#1a9c5b] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 border-none outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-400">No employees found</p>
          </div>
        ) : (
          grouped.map(([letter, emps]) => (
            <div key={letter}>
              <div className="px-4 py-1.5 bg-gray-50 sticky top-0 z-10">
                <span className="text-xs font-bold text-gray-400 tracking-widest">{letter}</span>
              </div>
              <div className="bg-white divide-y divide-gray-100">
                {emps.map((emp) => (
                  <motion.button
                    key={emp.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => { haptic(); setSelectedProfile(emp); }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 active:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: emp.color || "#1a9c5b" }}
                      >
                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusDot[emp.status] || "bg-gray-300"}`} />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{emp.first_name} {emp.last_name}</p>
                      <p className="text-xs text-gray-400">{roleLabels[emp.role] || emp.role}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <EmployeeDialog open={dialogOpen} onOpenChange={setDialogOpen} employee={editingEmployee} onSave={handleSave} />

      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Employee Profile</DialogTitle></DialogHeader>
          {selectedProfile && (
            <EmployeeProfile
              employee={selectedProfile}
              shifts={shifts}
              onEdit={() => { setEditingEmployee(selectedProfile); setDialogOpen(true); setSelectedProfile(null); }}
              onClose={() => setSelectedProfile(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}