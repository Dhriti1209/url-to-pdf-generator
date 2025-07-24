"use client";

import type React from "react";
import { useEffect, useState, FormEvent } from "react";
import { LinkIcon, HeartIcon, SparklesIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const POLL_INTERVAL = 5000;

const URLForm: React.FC = () => {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [pollingName, setPollingName] = useState<string | null>(null);

  // Load last PDF name on mount
  useEffect(() => {
    const lastPdf = localStorage.getItem("lastPdfName");
    if (lastPdf) setPollingName(lastPdf);
  }, []);

  // Polling for PDF availability
  useEffect(() => {
    if (!pollingName) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3000/v1/check/${pollingName}`);
        if (res.ok) {
          const data = await res.json();
          if (data.signedUrl) {
            setSignedUrl(data.signedUrl);
            setSuccess(true);
            setPollingName(null);
          }
        }
      } catch (_) {
        // continue polling silently
      }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [pollingName]);

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSignedUrl(null);

    // Validate URL
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/v1/pdf/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error(await res.text());

      const { pdfName } = await res.json();

      if (!pdfName) throw new Error("PDF name not received from server.");

      localStorage.setItem("lastPdfName", pdfName);
      setPollingName(pdfName);
      setUrl("");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 relative overflow-hidden">
      {/* Floating Icons */}
      <motion.div
        className="absolute top-0 right-0 text-pink-300 opacity-70"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <SparklesIcon size={24} />
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 text-pink-300 opacity-70"
        initial={{ rotate: 0 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <SparklesIcon size={24} />
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl shadow-lg p-8 border border-pink-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-center mb-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        >
          <HeartIcon className="h-7 w-7 text-pink-500 mr-2" />
          <h2 className="text-2xl font-bold text-pink-700">URL to PDF</h2>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-pink-400" />
            </div>

            <motion.input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className={`w-full pl-12 pr-4 py-4 border-2 ${error ? "border-red-300" : "border-pink-300"}
                          bg-white/90 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 
                          transition-all duration-300 text-gray-700 font-medium`}
              disabled={isSubmitting}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.p
                className="mt-3 text-sm text-red-500 bg-red-50 p-2 rounded-lg border border-red-200"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success Waiting */}
          <AnimatePresence>
            {success && !signedUrl && (
              <motion.div
                className="mt-3 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="mr-2"
                >
                  <SparklesIcon className="h-5 w-5 text-pink-500" />
                </motion.div>
                <span>Request sent! Waiting for PDF link...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PDF Link */}
          {signedUrl && (
            <motion.div
              className="mt-4 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200 break-words"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✅ PDF Ready:{" "}
              <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
                Open PDF
              </a>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="mt-5">
            <motion.button
              type="submit"
              disabled={isSubmitting || !url}
              className={`w-full py-4 px-6 rounded-2xl text-white font-medium text-lg
                ${
                  isSubmitting || !url
                    ? "bg-pink-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600"
                }
                transition-all duration-300 shadow-md`}
              whileHover={!isSubmitting && url ? { scale: 1.03 } : {}}
              whileTap={!isSubmitting && url ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="mr-3"
                  >
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </motion.div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Submit URL
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                    className="ml-2"
                  >
                    <HeartIcon className="h-5 w-5" />
                  </motion.div>
                </span>
              )}
            </motion.button>
          </div>
        </form>

        {/* Animated Heart Icons */}
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.2,
              }}
            >
              <HeartIcon className="h-4 w-4 text-pink-400" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default URLForm;
