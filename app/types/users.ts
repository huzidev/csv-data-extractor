export interface SearchResult {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  studio: string;
  createdAt: string;
}

export interface Studio {
  id: number;
  name: string;
}

export interface SearchActionData {
  success?: boolean;
  users?: SearchResult[];
  studios?: Studio[];
  count?: number;
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  deletedCount?: number;
  message?: string;
  error?: string;
  intent?: string;
}

export interface UserSearchProps {
  actionData?: SearchActionData;
}
