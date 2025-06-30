export interface ColumnMapping {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    studio: string;
  }
  
  export interface CsvData {
    headers: string[];
    data: any[];
  }

  export interface ActionData {
    success?: boolean;
    type?: string; 
    count?: number;
    updated?: number;
    skipped?: number;
    message?: string;
    error?: string;
  }
  
  export interface CsvUploaderProps {
    onDataMapped?: (mappedData: any[]) => void;
    actionData?: ActionData;
  }
  