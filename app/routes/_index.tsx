import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import CsvUploader from "~/components/CsvUploader";
import LoginForm from "~/components/LoginForm";

export const meta: MetaFunction = () => {
  return [
    { title: "CSV Data Extractor" },
    {
      name: "description",
      content: "Upload and map CSV data to database fields",
    },
  ];
};

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoggedIn ? <CsvUploader /> : <LoginForm onLogin={handleLogin} />}
    </div>
  );
}
