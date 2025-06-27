import { useSubmit } from "@remix-run/react";
import React, { useState } from "react";
import AlertMessage from "./AlertMessage";

interface SearchResult {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  studio: string;
  createdAt: string;
}

interface SearchActionData {
  success?: boolean;
  users?: SearchResult[];
  count?: number;
  error?: string;
}

interface UserSearchProps {
  actionData?: SearchActionData;
}

const UserSearch: React.FC<UserSearchProps> = ({ actionData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const submit = useSubmit();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("intent", "search-users");
    formData.append("searchTerm", searchTerm.trim());
    formData.append("searchType", searchType);
    
    submit(formData, { method: "post" });
  };

  const handleClear = () => {
    setSearchTerm("");
    setLoading(false);
  };

  React.useEffect(() => {
    if (actionData) {
      setLoading(false);
    }
  }, [actionData]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Search Users</h2>

      {actionData?.error && (
        <AlertMessage
          type="error"
          message={actionData.error}
          onClose={() => {}}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Term
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Enter ${searchType === "email" ? "email" : "phone number"} to search...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search By
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as "email" | "phone")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!searchTerm.trim() || loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {loading ? "Searching..." : "Search"}
            </button>
            
            {(searchTerm || actionData?.users) && (
              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
                disabled={loading}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {actionData?.success && actionData.users && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Search Results
            </h3>
            <span className="text-sm text-gray-600">
              {actionData.count} user{actionData.count !== 1 ? 's' : ''} found
            </span>
          </div>

          {actionData.users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No users found matching your search criteria.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Studio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {actionData.users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.studio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
