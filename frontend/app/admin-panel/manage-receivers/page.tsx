"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Check, X, Users, ChevronDown, ChevronUp, FileText } from "lucide-react";

export default function ManageReceiversPage() {
  const [receivers, setReceivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchReceivers();
  }, [statusFilter]);

  const fetchReceivers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/receivers/?status=${statusFilter}`);
      setReceivers(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch receivers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      await api.patch(`/admin/receivers/${id}/${action}/`);
      fetchReceivers();
    } catch (err) {
      console.error(`Failed to ${action} receiver`, err);
      alert(`Failed to ${action} receiver`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Manage Receivers</h1>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                statusFilter === status
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-6 overflow-hidden min-h-[50vh]">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground animate-pulse">
            Loading receivers...
          </div>
        ) : receivers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Nothing to see here</h3>
            <p className="text-muted-foreground text-sm">
              No receivers found with '{statusFilter}' status.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {receivers.map((req: any) => (
              <div
                key={req.id}
                className="flex flex-col bg-muted/20 rounded-xl border overflow-hidden transition-all hover:border-primary/30"
              >
                {/* Header Row */}
                <div
                  className="flex flex-col md:flex-row md:items-center justify-between p-5 cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                >
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-foreground">
                          {req.organization_name || req.hospital_name || req.full_name || "Unknown"}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                          {req.role.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Status: <span className="capitalize">{req.verification_status}</span>
                      </div>
                    </div>
                    
                    {/* Expand icon for mobile view */}
                    <div className="md:hidden text-muted-foreground ml-auto">
                        {expandedId === req.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="hidden md:block text-muted-foreground mr-4">
                      {expandedId === req.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                    {req.verification_status !== "approved" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(req.id, "approve");
                        }}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow hover:bg-emerald-700 transition-all"
                      >
                        <Check className="h-4 w-4" /> Approve
                      </button>
                    )}
                    {req.verification_status !== "rejected" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(req.id, "reject");
                        }}
                        className="flex items-center gap-2 bg-destructive/10 text-destructive px-5 py-2 rounded-xl text-sm font-semibold hover:bg-destructive/20 transition-all"
                      >
                        <X className="h-4 w-4" /> Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === req.id && (
                  <div className="p-5 border-t bg-card/50 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-muted-foreground">Reg No:</span>
                        <span className="col-span-2 font-medium">
                          {req.registration_number || req.cci_registration_number || req.hospital_registration_number || req.government_license_number || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-muted-foreground">Contact:</span>
                        <span className="col-span-2 font-medium">{req.contact_person || "N/A"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-muted-foreground">Email:</span>
                        <span className="col-span-2 font-medium">{req.email}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-muted-foreground">Phone:</span>
                        <span className="col-span-2 font-medium">{req.phone_number || "N/A"}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-muted-foreground">Address:</span>
                        <span className="col-span-2 font-medium capitalize">
                          {req.address_line1}, {req.city}, {req.state} - {req.pincode}
                        </span>
                      </div>
                      {req.registration_certificate_url && (
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <span className="font-semibold text-muted-foreground">Document:</span>
                          <span className="col-span-2">
                            <a
                              href={req.registration_certificate_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                            >
                              <FileText className="h-4 w-4" /> View Certificate
                            </a>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
