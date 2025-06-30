import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import CsvUploader from "~/components/CsvUploader";
import LoginForm from "~/components/LoginForm";
import UserSearch from "~/components/UserSearch";
import { createUsers, deleteUsers, getAllStudios, getUsersPaginated, searchUsers } from "~/db/users.server";

export const meta: MetaFunction = () => {
  return [
    { title: "CSV Data Extractor" },
    {
      name: "description",
      content: "Upload and map CSV data to database fields",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const intent = formData.get("intent");

    console.log("SW what is the intent?", intent);

    if (intent === "import-users") {
      const usersData = formData.get("users");
      if (!usersData) {
        return json({ error: "No user data provided" }, { status: 400 });
      }

      const users = JSON.parse(usersData as string);
      const result = await createUsers(users);

      if (!result.success) {
        return json({ error: result.error }, { status: 500 });
      }

      return json({ 
        success: true, 
        count: result.count,
        updated: result.updated,
        skipped: result.skipped,
        message: result.message
      });
    }

    if (intent === "search-users") {
      const searchTerm = formData.get("searchTerm");
      const searchType = formData.get("searchType");
      const studioFilter = formData.get("studioFilter") as string;

      if (!searchTerm) {
        return json({ error: "Search term is required" }, { status: 400 });
      }

      if (searchType !== "email" && searchType !== "phone" && searchType !== "name") {
        return json({ error: "Invalid search type" }, { status: 400 });
      }

      const result = await searchUsers(searchTerm as string, searchType, studioFilter || undefined);

      if (!result.success) {
        return json({ error: result.error }, { status: 500 });
      }

      return json({
        success: true,
        users: result.users,
        count: result.count,
      });
    }

    if (intent === "get-users") {
      const page = parseInt(formData.get("page") as string) || 1;
      const pageSize = parseInt(formData.get("pageSize") as string) || 50;
      const studioFilter = formData.get("studioFilter") as string || undefined;

      const result = await getUsersPaginated(page, pageSize, studioFilter);

      if (!result.success) {
        return json({ error: result.error }, { status: 500 });
      }

      return json({
        success: true,
        users: result.users,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
      });
    }

    if (intent === "get-studios") {
      const result = await getAllStudios();

      if (!result.success) {
        return json({ error: result.error }, { status: 500 });
      }

      return json({
        success: true,
        studios: result.studios,
      });
    }

    if (intent === "delete-users") {
      const userIdsString = formData.get("userIds");
      
      if (!userIdsString) {
        return json({ error: "No user IDs provided" }, { status: 400 });
      }

      const userIds = JSON.parse(userIdsString as string);
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return json({ error: "Invalid user IDs" }, { status: 400 });
      }

      const result = await deleteUsers(userIds);

      if (!result.success) {
        return json({ error: result.error }, { status: 500 });
      }

      return json({
        success: true,
        deletedCount: result.deletedCount,
        message: `Successfully deleted ${result.deletedCount} user${result.deletedCount !== 1 ? 's' : ''}`
      });
    }

    if (intent === "export-csv") {
      const searchTerm = formData.get("searchTerm") as string;
      const searchType = formData.get("searchType") as string;
      const studioFilter = formData.get("studioFilter") as string;

      let users: any[] = [];
      
      if (searchTerm && searchType) {
        // Export search results with optional studio filter
        const result = await searchUsers(searchTerm, searchType as "email" | "phone" | "name", studioFilter || undefined);
        if (!result.success) {
          return json({ error: result.error }, { status: 500 });
        }
        users = result.users || [];
      } else {
        // Export all users (with optional studio filter)
        const result = await getUsersPaginated(1, 999999, studioFilter || undefined);
        if (!result.success) {
          return json({ error: result.error }, { status: 500 });
        }
        users = result.users || [];
      }

      return json({
        success: true,
        intent: "export-csv",
        users: users,
        count: users.length
      });
    }

    return json({ error: "Invalid intent" }, { status: 400 });
  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"upload" | "users">("upload");
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    const loggedIn: boolean = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("upload")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "upload"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Upload CSV
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              User Management
            </button>
          </div>
        </div>
      </div>

      {activeTab === "upload" ? (
        <CsvUploader 
          onDataMapped={(data) => {
            const formData = new FormData();
            formData.append("intent", "import-users");
            formData.append("users", JSON.stringify(data));
            submit(formData, { method: "post" });
          }}
          actionData={actionData}
        />
      ) : (
        <UserSearch actionData={actionData} />
      )}
    </div>
  );
}
