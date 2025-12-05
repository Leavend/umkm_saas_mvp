import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Check, Clock } from "lucide-react";

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

export function RequestsHeader({ lang }: { lang: string }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Prompt Requests</h1>
                <p className="mt-1 text-slate-600">
                    Review and manage user prompt requests
                </p>
            </div>
            <Link href={`/${lang}/admin`}>
                <Button variant="outline" className="gap-2">
                    ← Back to Admin CMS
                </Button>
            </Link>
        </div>
    );
}

export function RequestsFilter({
    filter,
    setFilter,
}: {
    filter: RequestStatus | "all";
    setFilter: (f: RequestStatus | "all") => void;
}) {
    return (
        <div className="flex gap-2">
            {["all", "pending", "reviewed", "fulfilled"].map((f) => (
                <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f as typeof filter)}
                    className={
                        filter === f ? "bg-blue-600 text-white hover:bg-blue-700" : ""
                    }
                >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
            ))}
        </div>
    );
}

export function RequestsTable({
    requests,
    onStatusUpdate,
    filter,
}: {
    requests: Request[];
    onStatusUpdate: (id: string, status: RequestStatus) => void;
    filter: string;
}) {
    if (requests.length === 0) {
        return (
            <div className="overflow-hidden rounded-lg border bg-white shadow">
                <div className="p-12 text-center text-slate-500">
                    <p className="text-lg">No requests found</p>
                    <p className="mt-1 text-sm">
                        {filter !== "all"
                            ? `No ${filter} requests at this time`
                            : "No prompt requests have been submitted yet"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-white shadow">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-slate-700">
                                Description
                            </th>
                            <th className="p-4 text-left text-sm font-semibold text-slate-700">
                                Category
                            </th>
                            <th className="p-4 text-left text-sm font-semibold text-slate-700">
                                User
                            </th>
                            <th className="p-4 text-left text-sm font-semibold text-slate-700">
                                Status
                            </th>
                            <th className="p-4 text-left text-sm font-semibold text-slate-700">
                                Date
                            </th>
                            <th className="p-4 text-left text-sm font-semibold text-slate-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <RequestRow
                                key={req.id}
                                req={req}
                                onStatusUpdate={onStatusUpdate}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RequestRow({
    req,
    onStatusUpdate,
}: {
    req: Request;
    onStatusUpdate: (id: string, status: RequestStatus) => void;
}) {
    return (
        <tr className="border-t transition-colors hover:bg-slate-50">
            <td className="max-w-md p-4 text-sm text-slate-900">
                {req.description}
            </td>
            <td className="p-4 text-sm text-slate-600">{req.category || "-"}</td>
            <td className="p-4 text-sm text-slate-600">
                {req.user?.name || req.user?.email || "Guest"}
            </td>
            <td className="p-4">
                <StatusBadge status={req.status as RequestStatus} />
            </td>
            <td className="p-4 text-sm text-slate-600">
                {new Date(req.createdAt).toLocaleDateString()}
            </td>
            <td className="p-4">
                <RequestActions
                    status={req.status as RequestStatus}
                    id={req.id}
                    onStatusUpdate={onStatusUpdate}
                />
            </td>
        </tr>
    );
}

function RequestActions({
    status,
    id,
    onStatusUpdate,
}: {
    status: RequestStatus;
    id: string;
    onStatusUpdate: (id: string, status: RequestStatus) => void;
}) {
    return (
        <div className="flex gap-2">
            {status === "pending" && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusUpdate(id, "reviewed")}
                >
                    <Check className="h-4 w-4" />
                </Button>
            )}
            {status === "reviewed" && (
                <Button
                    size="sm"
                    variant="default"
                    onClick={() => onStatusUpdate(id, "fulfilled")}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Check className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: RequestStatus }) {
    const config = {
        pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800" },
        reviewed: { icon: Check, color: "bg-blue-100 text-blue-800" },
        fulfilled: { icon: Check, color: "bg-green-100 text-green-800" },
    };

    const { icon: Icon, color } = config[status];

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${color}`}
        >
            <Icon className="h-3 w-3" />
            {status}
        </span>
    );
}
