import React from "react";
import { Studio } from "~/types/users";

interface UserSearchFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: "email" | "phone" | "name";
  setSearchType: (type: "email" | "phone" | "name") => void;
  selectedStudio: string;
  handleStudioFilter: (studio: string) => void;
  loading: boolean;
  isSearchMode: boolean;
  studios: Studio[];
  onSearch: (e: React.FormEvent) => void;
  onClear: () => void;
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  selectedStudio,
  handleStudioFilter,
  loading,
  isSearchMode,
  studios,
  onSearch,
  onClear
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={onSearch} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Term
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Enter ${searchType === "email" ? "email" : searchType === "phone" ? "phone number" : "name"} to search...`}
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
              onChange={(e) => setSearchType(e.target.value as "email" | "phone" | "name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Studio
            </label>
            <select
              value={selectedStudio}
              onChange={(e) => handleStudioFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <option value="all">All Studios</option>
              {studios.map((studio) => (
                <option key={studio.id} value={studio.name}>
                  {studio.name}
                </option>
              ))}
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
          
          {isSearchMode && (
            <button
              type="button"
              onClick={onClear}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
              disabled={loading}
            >
              Clear Search
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserSearchForm;
