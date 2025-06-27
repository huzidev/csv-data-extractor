import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import { fieldLabels } from "~/constants/fieldLabels";
import { ColumnMapping, CsvData, CsvUploaderProps } from "~/types/csv";
import AlertMessage from "./AlertMessage";

const CsvUploader: React.FC<CsvUploaderProps> = ({ onDataMapped, actionData }) => {
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    studio: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle action data from Remix
  useEffect(() => {
    if (actionData) {
      setLoading(false);
      if (actionData.success) {
        const message = actionData.message || `Successfully imported ${actionData.count} users`;
        setSuccess(message);
        setError(null);
        // Clear form after successful submission
        setCsvData(null);
        setColumnMapping({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          studio: "",
        });
      } else if (actionData.error) {
        setError(actionData.error);
        setSuccess(null);
      }
    }
  }, [actionData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file");
      return;
    }

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError("Error parsing CSV: " + results.errors[0].message);
          setLoading(false);
          return;
        }

        const headers = Object.keys(results.data[0] || {});
        setCsvData({
          headers,
          data: results.data,
        });
        setLoading(false);
      },
      error: (error) => {
        setError("Error reading file: " + error.message);
        setLoading(false);
      },
    });
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateMapping = (): boolean => {
    return Object.values(columnMapping).every((value) => value !== "");
  };

  const handleSaveMapping = () => {
    if (!csvData || !validateMapping()) {
      setError("Please map all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const mappedData = csvData.data.map((row) => ({
      firstName: row[columnMapping.firstName],
      lastName: row[columnMapping.lastName],
      phone: row[columnMapping.phone],
      email: row[columnMapping.email],
      studio: row[columnMapping.studio],
    }));

    if (onDataMapped) {
      onDataMapped(mappedData);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Puppies&Yoga SMS manager
      </h1>

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <AlertMessage
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Upload CSV File
        </h2>
        <div className="flex items-center gap-4">
          <label className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded cursor-pointer flex items-center gap-2 disabled:opacity-50">
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Choose CSV File
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </label>
          {loading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          )}
        </div>
        {csvData && (
          <p className="text-sm text-gray-600 mt-2">
            Loaded {csvData.data.length} rows with columns:{" "}
            {csvData.headers.join(", ")}
          </p>
        )}
      </div>

      {csvData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Map CSV Columns to Database Fields
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(fieldLabels).map(([field, label]) => (
              <div key={field} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <select
                  value={columnMapping[field as keyof ColumnMapping]}
                  onChange={(e) =>
                    handleMappingChange(
                      field as keyof ColumnMapping,
                      e.target.value
                    )
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Column</option>
                  {csvData.headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handleSaveMapping}
              disabled={!validateMapping() || loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded flex items-center gap-2"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {loading ? "Saving..." : "Save to Database"}
            </button>
            <span className="text-sm text-gray-600">
              {validateMapping()
                ? "✓ All fields mapped"
                : "Please map all required fields"}
            </span>
          </div>
        </div>
      )}

      {csvData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Data Preview (First 5 rows)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {csvData.headers.map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {csvData.data.slice(0, 5).map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {csvData.headers.map((header) => (
                      <td
                        key={header}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {csvData.data.length > 5 && (
            <p className="text-sm text-gray-600 mt-2">
              ... and {csvData.data.length - 5} more rows
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CsvUploader;
