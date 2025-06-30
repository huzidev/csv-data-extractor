import React from "react";

interface UserManagementHeaderProps {
  onExportCSV: () => void;
  loading?: boolean;
  selectedStudio?: string;
  isSearchMode?: boolean;
  searchTerm?: string;
  userCount?: number;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onExportCSV,
  loading = false,
  selectedStudio = "all",
  isSearchMode = false,
  searchTerm = "",
  userCount = 0
}) => {
  const getExportDescription = () => {
    if (isSearchMode && searchTerm) {
      if (selectedStudio !== "all") {
        return `Export search results from ${selectedStudio} studio`;
      }
      return "Export search results from all studios";
    } else {
      if (selectedStudio !== "all") {
        return `Export all users from ${selectedStudio} studio`;
      }
      return "Export all users from all studios";
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
        <p className="text-gray-600 mt-1">
          Search, filter, and manage your users
        </p>
      </div>
      <div className="flex flex-col items-end">
        <button
          onClick={onExportCSV}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded flex items-center gap-2"
          title={getExportDescription()}
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {loading ? "Exporting Users..." : "Export CSV"}
        </button>
        {userCount > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {getExportDescription()}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserManagementHeader;
