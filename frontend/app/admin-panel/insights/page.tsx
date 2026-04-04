"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Activity, BarChart, FileText } from "lucide-react";

export default function ReceiverInsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await api.get("/admin/receiver-insights/");
      setInsights(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch receiver insights", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 animate-pulse text-muted-foreground">
        Loading insights...
      </div>
    );
  }

  // Group insights by receiver role type
  const groupedInsights = insights.reduce((acc: any, curr: any) => {
    const role = curr.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(curr);
    return acc;
  }, {});

  const categories = ["NGO", "ORPHANAGE", "OLD_AGE_HOME", "GOVERNMENT_HOSPITAL"];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 border-b pb-4">
        <BarChart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Receiver Insights</h1>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No Receivers Found</h3>
          <p className="text-muted-foreground text-sm">
            There are no receivers on the platform yet.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((role) => {
            const receiversForRole = groupedInsights[role] || [];
            if (receiversForRole.length === 0) return null;

            return (
              <section key={role} className="space-y-4">
                <h2 className="text-2xl font-bold capitalize text-primary flex items-center gap-2">
                  <Activity className="h-6 w-6" /> {role.replace(/_/g, " ")} Analytics
                </h2>

                <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Organization Name</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Requests Created</th>
                          <th className="px-6 py-4 text-center">Requests Fulfilled</th>
                          <th className="px-6 py-4 text-center">Requests Pending</th>
                          <th className="px-6 py-4 text-center">Donations Accepted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {receiversForRole.map((r: any) => (
                          <tr
                            key={r.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-4 font-bold text-foreground">
                              {r.organization_name}
                              <div className="text-xs text-muted-foreground font-normal mt-1">
                                {r.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 capitalize">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                                  r.verification_status === "approved"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : r.verification_status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {r.verification_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-medium">
                              {r.requests_created}
                            </td>
                            <td className="px-6 py-4 text-center text-emerald-600 font-bold">
                              {r.requests_fulfilled}
                            </td>
                            <td className="px-6 py-4 text-center text-amber-600 font-semibold">
                              {r.requests_pending}
                            </td>
                            <td className="px-6 py-4 text-center text-blue-600 font-bold">
                              {r.donations_accepted}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
