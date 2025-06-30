import { useSubmit } from "@remix-run/react";
import Papa from "papaparse";
import React, { useEffect, useRef, useState } from "react";
import { Studio, UserSearchProps } from "~/types/users";
import AlertMessage from "./AlertMessage";
import ConfirmationModal from "./ConfirmationModal";
import Pagination from "./Pagination";
import UserManagementHeader from "./UserManagementHeader";
import UserSearchForm from "./UserSearchForm";
import UsersTable from "./UsersTable";

const UserSearch: React.FC<UserSearchProps> = ({ actionData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"email" | "phone" | "name">("email");
  const [selectedStudio, setSelectedStudio] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [studios, setStudios] = useState<Studio[]>([]);
  const submit = useSubmit();
  const processedExportRef = useRef<string | null>(null);

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
    
    // Include studio filter in search if selected
    if (selectedStudio !== "all") {
      formData.append("studioFilter", selectedStudio);
    }
    
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
    
    // If in search mode, re-run search with new studio filter
    if (isSearchMode && searchTerm.trim()) {
      setLoading(true);
      const formData = new FormData();
      formData.append("intent", "search-users");
      formData.append("searchTerm", searchTerm.trim());
      formData.append("searchType", searchType);
      if (studio !== "all") {
        formData.append("studioFilter", studio);
      }
      submit(formData, { method: "post" });
    } else {
      // Not in search mode, just load users with studio filter
      setIsSearchMode(false);
      setSearchTerm("");
      loadUsers(1, studio);
    }
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

  const handleExportCSV = () => {
    setExportLoading(true);
    processedExportRef.current = null;
    
    const formData = new FormData();
    formData.append("intent", "export-csv");
    
    // Include search parameters if in search mode
    if (isSearchMode && searchTerm.trim()) {
      formData.append("searchTerm", searchTerm.trim());
      formData.append("searchType", searchType);
    }
    
    // Always include studio filter if one is selected
    if (selectedStudio !== "all") {
      formData.append("studioFilter", selectedStudio);
    }
    
    submit(formData, { method: "post" });
  };

  const downloadCSV = (users: any[]) => {
    const csvData = users.map(user => ({
      'First Name': user.firstName,
      'Last Name': user.lastName,
      'Email': user.email,
      'Phone': user.phone ? `="+${user.phone.replace(/^\+/, '')}"` : '',
      'Studio': user.studio,
      'Created Date': new Date(user.createdAt).toLocaleDateString()
    }));

    const csvContent = Papa.unparse(csvData, {
      header: true,
      delimiter: ',',
      newline: '\n',
      quotes: true,
      quoteChar: '"'
    });

    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}`;
    const filename = `users-export-${dateStr}.csv`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setExportLoading(false);
    setShowExportModal(true);
    
    setTimeout(() => {
      setShowExportModal(false);
    }, 3000);
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
      
      if (actionData.success && actionData.intent === "export-csv" && actionData.users) {
        const exportId = `${actionData.intent}-${actionData.users.length}`;
        if (processedExportRef.current !== exportId) {
          processedExportRef.current = exportId;
          downloadCSV(actionData.users);
        }
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
            // Include studio filter in search refresh if selected
            if (selectedStudio !== "all") {
              formData.append("studioFilter", selectedStudio);
            }
            submit(formData, { method: "post" });
          }
        } else {
          loadUsers(currentPage, selectedStudio);
        }
      }
    }
  }, [actionData]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <UserManagementHeader 
        onExportCSV={handleExportCSV}
        loading={exportLoading}
        selectedStudio={selectedStudio}
        isSearchMode={isSearchMode}
        searchTerm={searchTerm}
        userCount={actionData?.users?.length || actionData?.count || 0}
      />

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

      <UserSearchForm
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchType={searchType}
        setSearchType={setSearchType}
        selectedStudio={selectedStudio}
        handleStudioFilter={handleStudioFilter}
        loading={loading}
        isSearchMode={isSearchMode}
        studios={studios}
        onSearch={handleSearch}
        onClear={handleClear}
      />

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
              <UsersTable
                users={actionData.users}
                selectedUsers={selectedUsers}
                onUserSelect={handleUserSelect}
                onSelectAll={handleSelectAll}
              />

              <Pagination
                currentPage={actionData.currentPage || 1}
                totalPages={actionData.totalPages || 1}
                onPageChange={handlePageChange}
                loading={loading}
              />
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

      {/* Export Completion Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Export Completed
                </h3>
                <p className="text-sm text-gray-500">
                  Your CSV file has been downloaded successfully.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
