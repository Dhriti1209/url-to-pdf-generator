"use client"

import type React from "react";
import { useState } from "react";
import { LinkIcon, HeartIcon, SparklesIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const URLForm: React.FC = () => {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null); // ✅ new state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSignedUrl(null); // reset signed URL

    try {
      new URL(url);
    } catch (_) {
      setError("Please enter a valid URL including http:// or https://");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/v1/pdf/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Server error while generating PDF.");
      }

      const data = await response.json();

      if (data.signedUrl) {
        setSuccess(true);
        setUrl("");
        setSignedUrl(data.signedUrl); // ✅ store signed URL

        // Optionally open in new tab
        window.open(data.signedUrl, "_blank");
      } else {
        throw new Error("Signed URL not received from server.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 relative overflow-hidden">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-0 right-0 text-pink-300 opacity-70"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <SparklesIcon size={24} />
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 text-pink-300 opacity-70"
        initial={{ rotate: 0 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <SparklesIcon size={24} />
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl shadow-lg p-8 border border-pink-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex items-center justify-center mb-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <HeartIcon className="h-7 w-7 text-pink-500 mr-2" />
          <h2 className="text-2xl font-bold text-pink-700">URL Form</h2>
        </motion.div>

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
                          bg-white/90 backdrop-blur-sm
                          rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 
                          focus:border-pink-400 transition-all duration-300 text-gray-700 font-medium`}
              disabled={isSubmitting}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
          </div>

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

          <AnimatePresence>
            {success && (
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
                  transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                  className="mr-2"
                >
                  <SparklesIcon className="h-5 w-5 text-pink-500" />
                </motion.div>
                <span>Form submitted successfully! ✨</span>
              </motion.div>
            )}
          </AnimatePresence>

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
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
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
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    className="ml-2"
                  >
                    <HeartIcon className="h-5 w-5" />
                  </motion.div>
                </span>
              )}
            </motion.button>
          </div>
        </form>

        {/* Decorative bottom hearts */}
        <div className="flex justify-center mt-6 space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
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
  )
}

export default URLForm
