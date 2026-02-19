import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Phone, Mail, CalendarCheck, Eye } from "lucide-react";
import { motion } from "framer-motion";
import EmployeeDialog from "@/components/employees/EmployeeDialog";
import AvailabilityDialog from "@/components/availability/AvailabilityDialog";
import EmployeeProfile from "@/components/employees/EmployeeProfile";

const roleLabels = {
  lifeguard: "Lifeguard",
  head_lifeguard: "Head Lifeguard",
  supervisor: "Supervisor",
  manager: "Manager",
};

const statusStyles = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
  on_leave: "bg-amber-100 text-amber-700",
};

export default function Employees() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [availDialogOpen, setAvailDialogOpen] = useState(false);
  const [availEmployee, setAvailEmployee] = useState(null);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: availabilities = [] } = useQuery({
    queryKey: ["availabilities"],
    queryFn: () => base44.entities.EmployeeAvailability.list(),
  });

  const saveAvailability = useMutation({
    mutationFn: async (data) => {
      const existing = availabilities.find(a => a.employee_id === data.employee_id);
      if (existing) return base44.entities.EmployeeAvailability.update(existing.id, data);
      return base44.entities.EmployeeAvailability.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availabilities"] });
      setAvailDialogOpen(false);
    },
  });

  const createEmployee = useMutation({
    mutationFn: (data) => base44.entities.Employee.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDialogOpen(false);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDialogOpen(false);
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const handleSave = (formData) => {
    if (editingEmployee) {
      updateEmployee.mutate({ id: editingEmployee.id, data: formData });
    } else {
      createEmployee.mutate(formData);
    }
  };

  const filtered = employees.filter(
    (e) =>
      `${e.first_name} ${e.last_name} ${e.email} ${e.role}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Employees</h1>
          <p className="text-gray-400 mt-2 text-lg">{employees.length} team member{employees.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full border-gray-200"
            />
          </div>
          <Button
            onClick={() => { setEditingEmployee(null); setDialogOpen(true); }}
            className="bg-[#1a9c5b] hover:bg-[#158a4e] rounded-full flex-shrink-0"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((emp, i) => (
          <motion.div
            key={emp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="p-5 border border-gray-100 shadow-none rounded-2xl hover:border-gray-200 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: emp.color || "#0ea5e9" }}
                  >
                    {(emp.first_name?.[0] || "")}{(emp.last_name?.[0] || "")}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {emp.first_name} {emp.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{roleLabels[emp.role] || emp.role}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditingEmployee(emp); setDialogOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setAvailEmployee(emp); setAvailDialogOpen(true); }}>
                      <CalendarCheck className="w-3.5 h-3.5 mr-2" /> Set Availability
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => deleteEmployee.mutate(emp.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className={`text-xs rounded-full ${statusStyles[emp.status] || ""}`}>
                  {emp.status}
                </Badge>
                {emp.hourly_rate && (
                  <Badge variant="outline" className="text-xs rounded-full">${emp.hourly_rate}/hr</Badge>
                )}
              </div>
              <div className="mt-3 space-y-1.5">
                {emp.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-3.5 h-3.5" /> {emp.email}
                  </div>
                )}
                {emp.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5" /> {emp.phone}
                  </div>
                )}
                {availabilities.find(a => a.employee_id === emp.id) && (
                  <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
                    <CalendarCheck className="w-3 h-3" /> Availability set
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16 text-slate-400">
          <p className="font-medium">No employees found</p>
          <p className="text-sm mt-1">Add your first team member to get started</p>
        </div>
      )}

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editingEmployee}
        onSave={handleSave}
      />
      <AvailabilityDialog
        open={availDialogOpen}
        onOpenChange={setAvailDialogOpen}
        employee={availEmployee}
        availability={availabilities.find(a => a.employee_id === availEmployee?.id)}
        onSave={(data) => saveAvailability.mutate(data)}
      />
    </div>
  );
}