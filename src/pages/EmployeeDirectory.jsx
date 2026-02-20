import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Filter, Mail, Phone, MapPin, Briefcase, Download } from "lucide-react";
import { motion } from "framer-motion";
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

export default function EmployeeDirectory() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => base44.entities.Shift.list("-created_date", 500),
  });

  const filtered = useMemo(() => {
    let result = employees;

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((e) => e.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((e) => e.status === statusFilter);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (e) =>
          `${e.first_name} ${e.last_name} ${e.email} ${e.phone || ""}`.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (sortBy === "name") {
      result.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
    } else if (sortBy === "role") {
      result.sort((a, b) => a.role.localeCompare(b.role));
    } else if (sortBy === "status") {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    return result;
  }, [employees, roleFilter, statusFilter, search, sortBy]);

  const stats = useMemo(
    () => ({
      total: employees.length,
      active: employees.filter((e) => e.status === "active").length,
      inactive: employees.filter((e) => e.status === "inactive").length,
      onLeave: employees.filter((e) => e.status === "on_leave").length,
    }),
    [employees]
  );

  const handleExportCSV = () => {
    const csv = [
      ["First Name", "Last Name", "Email", "Phone", "Role", "Status", "Hourly Rate"],
      ...filtered.map((e) => [
        e.first_name,
        e.last_name,
        e.email || "",
        e.phone || "",
        roleLabels[e.role],
        e.status,
        e.hourly_rate || "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employee-directory-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Employee Directory</h1>
          <p className="text-gray-400 mt-2 text-lg">{stats.total} team members</p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="gap-2 rounded-full"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-600" },
          { label: "Active", value: stats.active, color: "text-green-600" },
          { label: "Inactive", value: stats.inactive, color: "text-slate-500" },
          { label: "On Leave", value: stats.onLeave, color: "text-amber-600" },
        ].map((s, i) => (
          <Card key={i} className="border-gray-200">
            <CardContent className="pt-6">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <Briefcase className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="lifeguard">Lifeguard</SelectItem>
                <SelectItem value="head_lifeguard">Head Lifeguard</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-500">
          Showing {filtered.length} of {employees.length} employees
        </div>
      </div>

      {/* Employee Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-gray-500 font-medium">No employees found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
          {filtered.map((emp, i) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="cursor-pointer"
              onClick={() => setSelectedEmployee(emp)}
            >
              <Card className={`border-gray-200 hover:shadow-md transition-all h-full ${
                viewMode === "list" ? "p-4" : "p-5"
              }`}>
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: emp.color || "#0ea5e9" }}
                  >
                    {(emp.first_name?.[0] || "")}{(emp.last_name?.[0] || "")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {emp.first_name} {emp.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{roleLabels[emp.role]}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className={`text-xs rounded-full ${statusStyles[emp.status]}`}>
                        {emp.status}
                      </Badge>
                      {emp.hourly_rate && (
                        <Badge variant="outline" className="text-xs rounded-full">
                          ${emp.hourly_rate}/hr
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                  {emp.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a href={`mailto:${emp.email}`} className="truncate hover:text-[#1a9c5b]">
                        {emp.email}
                      </a>
                    </div>
                  )}
                  {emp.phone && (
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a href={`tel:${emp.phone}`} className="hover:text-[#1a9c5b]">
                        {emp.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 text-[#1a9c5b] border-[#1a9c5b] hover:bg-[#f0faf5]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmployee(emp);
                  }}
                >
                  View Profile
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Profile Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeProfile
              employee={selectedEmployee}
              shifts={shifts}
              onEdit={() => setSelectedEmployee(null)}
              onClose={() => setSelectedEmployee(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}