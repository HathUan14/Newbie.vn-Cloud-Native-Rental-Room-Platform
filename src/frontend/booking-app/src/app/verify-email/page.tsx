"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );
  const [message, setMessage] = useState("Đang xác thực...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token không tồn tại!");
      return;
    }

    fetch("http://localhost:3000/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.success ? "success" : "error");
        setMessage(data.message);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Xác thực thất bại");
      });
  }, [token]);

  const getIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case "error":
        return <XCircle className="w-12 h-12 text-red-600" />;
      default:
        return <Clock className="w-12 h-12 text-gray-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-sm w-full text-center">
        <div className="mb-4 flex justify-center">{getIcon()}</div>
        <h1 className="text-xl font-semibold mb-2">
          {status === "success" && "Xác thực thành công"}
          {status === "error" && "Xác thực thất bại"}
          {status === "pending" && "Đang xác thực..."}
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        {status === "success" && (
          <a
            href="/dashboard"
            className="inline-block bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-md font-medium transition"
          >
            Về trang quản lý
          </a>
        )}
        {status === "error" && (
          <a
            href="/resend-verification"
            className="inline-block bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-md font-medium transition"
          >
            Gửi lại email
          </a>
        )}
      </div>
    </div>
  );
}
