/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signUp, signIn, clearError } from "@/store/authSlice";
import { useRouter } from "next/navigation";


interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
}

export const LoginModal = ({ isOpen, onClose, colors }: LoginModalProps) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: ""
  });
  const [localError, setLocalError] = useState("");

  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);

useEffect(() => {
  if (user) {
    onClose();
    setFormData({ email: "", password: "", name: "", confirmPassword: "" });
    if (user.role === "admin") {
      router.push("/admin");
    }
  }
}, [user, onClose, router]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      setTimeout(() => {
        setLocalError("");
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setLocalError("Password must be at least 6 characters");
        return;
      }
      await dispatch(signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name
      })).unwrap();
    } else {
      await dispatch(signIn({
        email: formData.email,
        password: formData.password
      })).unwrap();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLocalError("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-1100"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-1101"
          >
            <div
              className="rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: colors.background }}
            >
              <div className="relative p-6 border-b" style={{ borderColor: `${colors.textLight}20` }}>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-1 rounded-full transition-colors hover:bg-black/5"
                >
                  <X size={20} style={{ color: colors.textDark }} />
                </button>
                <div className="text-center">
                  <h2 className="text-2xl font-medium mb-1" style={{ color: colors.textDark }}>
                    CARTHAGE
                  </h2>
                  <p className="text-xs tracking-[2px]" style={{ color: colors.primary }}>
                    Events
                  </p>
                </div>
              </div>

              <div className="p-6">
                {localError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center"
                  >
                    {localError}
                  </motion.div>
                )}

                <div className="flex gap-2 mb-6 p-1 rounded-full" style={{ background: `${colors.textLight}10` }}>
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                      isLogin ? "text-white shadow-md" : ""
                    }`}
                    style={isLogin ? { background: colors.primary } : { color: colors.textLight }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                      !isLogin ? "text-white shadow-md" : ""
                    }`}
                    style={!isLogin ? { background: colors.primary } : { color: colors.textLight }}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: colors.textLight }}
                      />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none transition-all text-sm"
                        style={{
                          borderColor: `${colors.textLight}30`,
                          background: colors.background,
                          color: colors.textDark
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                        onBlur={(e) => e.currentTarget.style.borderColor = `${colors.textLight}30`}
                        required
                      />
                    </motion.div>
                  )}

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: colors.textLight }}
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none transition-all text-sm"
                      style={{
                        borderColor: `${colors.textLight}30`,
                        background: colors.background,
                        color: colors.textDark
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                      onBlur={(e) => e.currentTarget.style.borderColor = `${colors.textLight}30`}
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: colors.textLight }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border focus:outline-none transition-all text-sm"
                      style={{
                        borderColor: `${colors.textLight}30`,
                        background: colors.background,
                        color: colors.textDark
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                      onBlur={(e) => e.currentTarget.style.borderColor = `${colors.textLight}30`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff size={18} style={{ color: colors.textLight }} />
                      ) : (
                        <Eye size={18} style={{ color: colors.textLight }} />
                      )}
                    </button>
                  </div>

                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: colors.textLight }}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none transition-all text-sm"
                        style={{
                          borderColor: `${colors.textLight}30`,
                          background: colors.background,
                          color: colors.textDark
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                        onBlur={(e) => e.currentTarget.style.borderColor = `${colors.textLight}30`}
                        required
                      />
                    </motion.div>
                  )}

                  {isLogin && (
                    <div className="text-right">
                      <button
                        type="button"
                        className="text-xs hover:underline transition-colors"
                        style={{ color: colors.primary }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full py-3 rounded-full text-white font-medium text-sm transition-all shadow-lg disabled:opacity-50"
                    style={{ background: colors.primary }}
                  >
                    {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                  </motion.button>
                </form>

                {!isLogin && (
                  <p className="text-xs text-center mt-4" style={{ color: colors.textLight }}>
                    By signing up, you agree to our{" "}
                    <button type="button" className="hover:underline" style={{ color: colors.primary }}>
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button type="button" className="hover:underline" style={{ color: colors.primary }}>
                      Privacy Policy
                    </button>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};