import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Mail, Phone } from "lucide-react";
import EmployeeDialog from "@/components/employees/EmployeeDialog";
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

export default function MobileEmployees() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => base44.entities.Shift.list("-created_date", 500),
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

  const filtered = useMemo(() => {
    if (!search) return employees;
    const searchLower = search.toLowerCase();
    return employees.filter((e) =>
      `${e.first_name} ${e.last_name} ${e.email} ${e.phone || ""}`.toLowerCase().includes(searchLower)
    );
  }, [employees, search]);

  const handleSave = (formData) => {
    if (editingEmployee) {
      updateEmployee.mutate({ id: editingEmployee.id, data: formData });
    } else {
      createEmployee.mutate(formData);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="text-sm text-gray-500">{employees.length} team members</p>
      </div>

      {/* Search and Add */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <Button
          onClick={() => {
            setEditingEmployee(null);
            setDialogOpen(true);
          }}
          className="w-full bg-[#1a9c5b] hover:bg-[#158a4e]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      {/* Employees List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-gray-500 text-sm">No employees found</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((emp) => (
            <Card
              key={emp.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedProfile(emp)}
            >
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: emp.color || "#0ea5e9" }}
                    >
                      {(emp.first_name?.[0] || "")}{(emp.last_name?.[0] || "")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{roleLabels[emp.role]}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={`text-xs rounded-full ${statusStyles[emp.status] || ""}`}
                    >
                      {emp.status}
                    </Badge>
                    {emp.hourly_rate && (
                      <Badge variant="outline" className="text-xs rounded-full">
                        ${emp.hourly_rate}/hr
                      </Badge>
                    )}
                  </div>

                  {emp.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${emp.email}`} className="truncate">
                        {emp.email}
                      </a>
                    </div>
                  )}

                  {emp.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${emp.phone}`}>{emp.phone}</a>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEmployee(emp);
                        setDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEmployee.mutate(emp.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editingEmployee}
        onSave={handleSave}
      />

      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <EmployeeProfile
              employee={selectedProfile}
              shifts={shifts}
              onEdit={() => {
                setEditingEmployee(selectedProfile);
                setDialogOpen(true);
                setSelectedProfile(null);
              }}
              onClose={() => setSelectedProfile(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}