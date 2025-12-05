// Client component for admin requests table
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { updateRequestStatus } from "~/actions/prompt-requests";
import { toast } from "sonner";
import { Container } from "~/components/container";
import {
  RequestsHeader,
  RequestsFilter,
  RequestsTable,
} from "./client-parts";

type RequestStatus = "pending" | "reviewed" | "fulfilled";

interface Request {
  id: string;
  description: string;
  category: string | null;
  status: string;
  createdAt: Date;
  userId: string | null;
  guestSessionId: string | null;
  user: { name: string | null; email: string | null } | null;
}

interface AdminRequestsClientProps {
  requests: Request[];
}

export function AdminRequestsClient({
  requests: initialRequests,
}: AdminRequestsClientProps) {
  const params = useParams();
  const lang = (params.lang as string) || "en";
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");

  const handleStatusUpdate = async (id: string, status: RequestStatus) => {
    const result = await updateRequestStatus(id, status);

    if (result.success) {
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req)),
      );
      toast.success(`Status updated to ${status}`);
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  const filtered = requests.filter(
    (req) => filter === "all" || req.status === filter,
  );

  return (
    <Container>
      <div className="mx-auto max-w-6xl space-y-6">
        <RequestsHeader lang={lang} />
        <RequestsFilter filter={filter} setFilter={setFilter} />
        <RequestsTable
          requests={filtered}
          onStatusUpdate={handleStatusUpdate}
          filter={filter}
        />
      </div>
    </Container>
  );
}
