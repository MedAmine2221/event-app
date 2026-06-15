"use client";

import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Settings, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginModal } from "./LoginModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, setUser } from "@/store/authSlice";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";

const navLinks = ["HOME", "About", "Services", "Blog", "Contact"];

interface NavbarProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
}

export const Navbar = ({ colors }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(user));
    });
    return () => unsubscribe();
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-1000 bg-[rgba(251,248,241,0.95)] backdrop-blur-sm border-b border-black/5">
        <div className="flex items-center justify-between h-20 px-8 md:px-10 max-w-350 mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xl tracking-[4px] font-medium" style={{ color: colors.primary }}>
              Dar Bouraoui
            </span>
            <span className="text-xs tracking-[2px] block" style={{ color: colors.textLight }}>
              CARTHAGE
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link}
                href="#"
                className="text-[13px] tracking-[1.5px] no-underline font-normal transition-colors duration-200"
                style={{ color: colors.textDark }}
                whileHover={{ color: colors.primary }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {link}
              </motion.a>
            ))}
            
            {user ? (
              // User Avatar and Menu
              <div className="relative">
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover border-2"
                      style={{ borderColor: colors.primary }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: colors.primary }}
                    >
                      <User size={20} className="text-white" />
                    </div>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden z-50"
                        style={{ background: colors.background }}
                      >
                        <div className="p-3 border-b" style={{ borderColor: `${colors.textLight}20` }}>
                          <p className="text-sm font-medium" style={{ color: colors.textDark }}>
                            {user.displayName || "User"}
                          </p>
                          <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                            {user.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              // Navigate to profile page
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-black/5 transition-colors flex items-center gap-2"
                            style={{ color: colors.textDark }}
                          >
                            <UserCircle size={16} />
                            My Profile
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              // Navigate to settings
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-black/5 transition-colors flex items-center gap-2"
                            style={{ color: colors.textDark }}
                          >
                            <Settings size={16} />
                            Settings
                          </button>
                          <hr className="my-1" style={{ borderColor: `${colors.textLight}20` }} />
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-black/5 transition-colors flex items-center gap-2 text-red-600"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={() => setIsLoginModalOpen(true)}
                className="border-none px-7 py-2.5 rounded-full text-white text-[13px] tracking-[1px] font-medium cursor-pointer transition-opacity"
                style={{ background: colors.primary }}
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                BOOK
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden bg-transparent border-none cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[rgba(251,248,241,0.98)] backdrop-blur-sm border-t border-black/5"
            >
              <div className="flex flex-col items-center py-8 gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-[13px] tracking-[1.5px] no-underline"
                    style={{ color: colors.textDark }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link}
                  </a>
                ))}
                {user ? (
                  <>
                    <div className="flex flex-col items-center gap-3">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          width={50}
                          height={50}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ background: colors.primary }}
                        >
                          <User size={24} className="text-white" />
                        </div>
                      )}
                      <p className="text-sm font-medium" style={{ color: colors.textDark }}>
                        {user.displayName || user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        // Navigate to profile
                        setMobileMenuOpen(false);
                      }}
                      className="w-full max-w-50 px-7 py-2.5 rounded-full text-white text-[13px] tracking-[1px] font-medium"
                      style={{ background: colors.primary }}
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full max-w-50 px-7 py-2.5 rounded-full text-white text-[13px] tracking-[1px] font-medium bg-red-600"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="border-none px-7 py-2.5 rounded-full text-white text-[13px] tracking-[1px] font-medium"
                    style={{ background: colors.primary }}
                  >
                    BOOK
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        colors={colors}
      />
    </>
  );
};