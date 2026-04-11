// src/pages/recruiter/CvPreviewModal.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Loader2,
  AlertCircle,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import Modal from "../allmodals/Modal";

const CvPreviewModal = ({ isOpen, onClose, cvId, cvFileName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const objectUrlRef = useRef(null);
  const token = JSON.parse(sessionStorage.getItem("accessToken"));

  useEffect(() => {
    if (isOpen && cvId) {
      fetchCvFile();
    }

    return () => {
      // Cleanup blob URL on unmount or when modal closes
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [isOpen, cvId]);

  // Revoke old URL when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPdfUrl(null);
      setError(null);
    }
  }, [isOpen]);

  const fetchCvFile = async () => {
    setLoading(true);
    setError(null);

    // Revoke previous blob URL if any
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPdfUrl(null);

    try {
      const response = await fetch(`${BASE_URL}/job-seeker/cvs/${cvId}/file`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        let message = "Failed to load CV file";
        try {
          const json = JSON.parse(text);
          message = json.message || message;
        } catch (_) {
          /* ignore */
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      setPdfUrl(url);
    } catch (err) {
      setError(err.message || "An error occurred while loading the CV");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = cvFileName || `cv-${cvId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title={"Document Preview"}
      subtitle={`${cvFileName} preview`}
      size="xl"
    >
      <div className="flex-1 h-[90vh] relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-gray-100 dark:bg-gray-800">
            <Loader2 className="animate-spin text-theme_color" size={40} />
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Loading CV...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-gray-100 dark:bg-gray-800 p-8">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Failed to Load CV
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={fetchCvFile}
                className="px-5 py-2 bg-theme_color hover:bg-theme_color/90 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* PDF iframe */}
        {pdfUrl && !loading && !error && (
          <iframe
            src={pdfUrl}
            title={cvFileName || "CV Preview"}
            className="w-full h-full border-0"
            style={{ display: "block" }}
          />
        )}
      </div>
    </Modal>
  );
};

export default CvPreviewModal;
