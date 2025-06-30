import React from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studio: string;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  selectedUsers: number[];
  onUserSelect: (userId: number) => void;
  onSelectAll: () => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  selectedUsers,
  onUserSelect,
  onSelectAll
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={users.length > 0 && users.every(user => selectedUsers.includes(user.id))}
                onChange={onSelectAll}
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
          {users.map((user, index) => (
            <tr
              key={user.id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => onUserSelect(user.id)}
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
  );
};

export default UsersTable;
