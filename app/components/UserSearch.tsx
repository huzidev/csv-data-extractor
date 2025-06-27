import { useSubmit } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import { Studio, UserSearchProps } from "~/types/users";
import AlertMessage from "./AlertMessage";
import ConfirmationModal from "./ConfirmationModal";

const UserSearch: React.FC<UserSearchProps> = ({ actionData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"email" | "phone" | "name">("email");
  const [selectedStudio, setSelectedStudio] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [studios, setStudios] = useState<Studio[]>([]);
  const submit = useSubmit();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      return;
    }

    setLoading(true);
    setIsSearchMode(true);
    setSelectedUsers([]);

    const formData = new FormData();
    formData.append("intent", "search-users");
    formData.append("searchTerm", searchTerm.trim());
    formData.append("searchType", searchType);
    
    submit(formData, { method: "post" });
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsSearchMode(false);
    setSelectedUsers([]);
    setSelectedStudio("all");
    setCurrentPage(1);
    setLoading(false);
    loadUsers(1, "all");
  };

  const loadUsers = (page: number, studioFilter?: string) => {
    setLoading(true);
    setCurrentPage(page);
    
    const formData = new FormData();
    formData.append("intent", "get-users");
    formData.append("page", page.toString());
    formData.append("pageSize", "50");
    
    const filterToUse = studioFilter !== undefined ? studioFilter : selectedStudio;
    if (filterToUse !== "all") {
      formData.append("studioFilter", filterToUse);
    }
    
    submit(formData, { method: "post" });
  };

  const loadStudios = () => {
    const formData = new FormData();
    formData.append("intent", "get-studios");
    submit(formData, { method: "post" });
  };

  const handleStudioFilter = (studio: string) => {
    setSelectedStudio(studio);
    setSelectedUsers([]);
    setCurrentPage(1);
    setIsSearchMode(false); 
    setSearchTerm("");
    loadUsers(1, studio);
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (!actionData?.users) return;
    
    const allCurrentPageIds = actionData.users.map(user => user.id);
    const allSelected = allCurrentPageIds.every(id => selectedUsers.includes(id));
    
    if (allSelected) {
      setSelectedUsers(prev => prev.filter(id => !allCurrentPageIds.includes(id)));
    } else {
      setSelectedUsers(prev => [...new Set([...prev, ...allCurrentPageIds])]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedUsers.length === 0) return;
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    setLoading(true);
    setShowConfirmModal(false);
    
    const formData = new FormData();
    formData.append("intent", "delete-users");
    formData.append("userIds", JSON.stringify(selectedUsers));
    
    submit(formData, { method: "post" });
  };

  const handlePageChange = (page: number) => {
    loadUsers(page);
  };

  useEffect(() => {
    setLoading(true);
    loadStudios();
  }, []);

  useEffect(() => {
    if (actionData) {
      setLoading(false);
      
      if (actionData.success && actionData.studios) {
        setStudios(actionData.studios);
        loadUsers(1, "all");
        return; 
      }
      
      if (actionData.success && actionData.deletedCount !== undefined) {
        setSelectedUsers([]);
        if (isSearchMode) {
          if (searchTerm.trim()) {
            const formData = new FormData();
            formData.append("intent", "search-users");
            formData.append("searchTerm", searchTerm.trim());
            formData.append("searchType", searchType);
            submit(formData, { method: "post" });
          }
        } else {
          loadUsers(currentPage, selectedStudio);
        }
      }
    }
  }, [actionData]);

  const renderPagination = () => {
    if (!actionData?.totalPages || actionData.totalPages <= 1) return null;

    const { currentPage = 1, totalPages = 1 } = actionData;
    const pages = [];
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 text-sm rounded ${
              page === currentPage
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">User Management</h2>

      {actionData?.error && (
        <AlertMessage
          type="error"
          message={actionData.error}
          onClose={() => {}}
        />
      )}

      {actionData?.success && actionData.message && (
        <AlertMessage
          type="success"
          message={actionData.message}
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
                disabled={loading || isSearchMode}
              >
                <option value="all">All Studios</option>
                {studios.map((studio) => (
                  <option key={studio.id} value={studio.name}>
                    {studio.name}
                  </option>
                ))}
              </select>
              {isSearchMode && (
                <p className="text-xs text-gray-500 mt-1">Studio filter disabled during search</p>
              )}
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
                onClick={handleClear}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
                disabled={loading}
              >
                Clear Search
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users Table */}
      {loading && !actionData?.users ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        </div>
      ) : actionData?.users ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {isSearchMode ? 'Search Results' : 'All Users'}
              </h3>
              <p className="text-sm text-gray-600">
                {isSearchMode 
                  ? `${actionData.count} user${actionData.count !== 1 ? 's' : ''} found`
                  : `Showing ${actionData.users.length} of ${actionData.totalCount} users (Page ${actionData.currentPage} of ${actionData.totalPages})${selectedStudio !== 'all' ? ` - Filtered by: ${selectedStudio}` : ''}`
                }
              </p>
            </div>
            
            {selectedUsers.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
                disabled={loading}
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Selected ({selectedUsers.length})
              </button>
            )}
          </div>

          {actionData.users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {isSearchMode ? 'No users found matching your search criteria.' : 'No users found.'}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={actionData.users.length > 0 && actionData.users.every(user => selectedUsers.includes(user.id))}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
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

              {renderPagination()}
            </>
          )}
        </div>
      ) : null}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        userCount={selectedUsers.length}
      />
    </div>
  );
};

export default UserSearch;
