"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Activity
} from "lucide-react";

interface DashboardStats {
  total_requests: number;
  approved: number;
  rejected: number;
  pending: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboard-stats/");
      // Accessing response.data.data because of unified 'success_response' wrapper
      setStats(res.data?.data || null);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground animate-pulse">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 border-b pb-4">
        <Activity className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Registrations */}
        <div className="relative overflow-hidden bg-card rounded-2xl border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Registrations</h3>
            <div className="h-10 w-10 bg-blue-100/50 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="text-4xl font-extrabold">{stats?.total_requests || 0}</div>
          <div className="mt-2 text-xs text-muted-foreground text-blue-600 font-medium">
            All receiver registrations
          </div>
        </div>

        {/* Approved */}
        <div className="relative overflow-hidden bg-card rounded-2xl border shadow-sm p-6 hover:shadow-md transition-shadow border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Approved</h3>
            <div className="h-10 w-10 bg-emerald-100/50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-emerald-700">{stats?.approved || 0}</div>
          <div className="mt-2 text-xs text-muted-foreground font-medium text-emerald-600">
            Active on platform
          </div>
        </div>

        {/* Pending */}
        <div className="relative overflow-hidden bg-card rounded-2xl border shadow-sm p-6 hover:shadow-md transition-shadow border-amber-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending</h3>
            <div className="h-10 w-10 bg-amber-100/50 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-amber-600">{stats?.pending || 0}</div>
          <div className="mt-2 text-xs text-muted-foreground font-medium text-amber-600">
            Awaiting verification
          </div>
        </div>

        {/* Rejected */}
        <div className="relative overflow-hidden bg-card rounded-2xl border shadow-sm p-6 hover:shadow-md transition-shadow border-red-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rejected</h3>
            <div className="h-10 w-10 bg-red-100/50 rounded-full flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-red-600">{stats?.rejected || 0}</div>
          <div className="mt-2 text-xs text-muted-foreground font-medium text-red-500">
            Denied applications
          </div>
        </div>

      </div>

    </div>
  );
}
