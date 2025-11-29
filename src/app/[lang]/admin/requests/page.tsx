// Admin page for managing prompt requests
import { getPromptRequests } from "~/actions/prompt-requests";
import { AdminRequestsClient } from "./client";

export const metadata = {
  title: "Prompt Requests - Admin",
  description: "Manage user prompt requests",
};

export default async function AdminRequestsPage() {
  const result = await getPromptRequests();

  if (!result.success) {
    return (
      <div className="p-8">
        <p className="text-red-600">{result.error}</p>
      </div>
    );
  }

  return <AdminRequestsClient requests={result.data?.requests || []} />;
}
