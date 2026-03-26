"use client";

import { deleteMe, updateMe } from "@/api/auth";
import { useAuth } from "@/store/authStore";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  ShieldAlert,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose: () => void;
}

type Tab = "name" | "password" | "danger";

export default function AccountSettingsModal({ onClose }: Props) {
  const navigate = useNavigate();
  const { user, setAuth, clearAuth, accessToken } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("name");

  // Name form
  const [newName, setNewName] = useState(user?.full_name ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleApiError = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) return detail.map((d: { msg: string }) => d.msg).join(" ");
    }
    return "An unexpected error occurred. Please try again.";
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      setNameError("Name cannot be blank.");
      return;
    }
    setNameLoading(true);
    setNameError(null);
    try {
      const updated = await updateMe({ full_name: newName.trim() });
      if (user && accessToken) {
        setAuth({ ...user, ...updated }, accessToken);
      }
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      setNameError(handleApiError(err));
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword) {
      setPwError("Password cannot be empty.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPwError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/\d/.test(newPassword)) {
      setPwError("Password must contain at least one digit.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwLoading(true);
    setPwError(null);
    try {
      await updateMe({ password: newPassword });
      setPwSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(handleApiError(err));
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm account deletion.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteMe();
      clearAuth();
      navigate("/");
    } catch (err) {
      setDeleteError(handleApiError(err));
      setDeleteLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "name", label: "Name", icon: <User size={14} /> },
    { id: "password", label: "Password", icon: <KeyRound size={14} /> },
    { id: "danger", label: "Danger", icon: <ShieldAlert size={14} /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-[2rem] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 rounded-br-[2rem] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-0">
              <div>
                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                  Account Settings
                </h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500/40 hover:bg-cyan-950/30 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-8 pt-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id
                      ? tab.id === "danger"
                        ? "bg-red-950/40 border border-red-500/40 text-red-400"
                        : "bg-cyan-950/40 border border-cyan-500/40 text-cyan-400"
                      : "bg-white/5 border border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-8 pt-6 min-h-[260px]">
              <AnimatePresence mode="wait">
                {/* ── NAME TAB ── */}
                {activeTab === "name" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          setNameError(null);
                        }}
                        placeholder="Your full name"
                        className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm font-mono"
                      />
                    </div>

                    {nameError && (
                      <p className="text-red-400 text-xs flex items-center gap-2">
                        <AlertTriangle size={12} /> {nameError}
                      </p>
                    )}

                    {nameSuccess && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-emerald-400 text-xs flex items-center gap-2"
                      >
                        <CheckCircle2 size={12} /> Name updated successfully.
                      </motion.p>
                    )}

                    <button
                      onClick={handleNameUpdate}
                      disabled={nameLoading}
                      className="w-full py-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-400/50 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {nameLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <User size={14} />
                      )}
                      Update Name
                    </button>
                  </motion.div>
                )}

                {/* ── PASSWORD TAB ── */}
                {activeTab === "password" && (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    {user?.is_oauth && (
                      <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-500/30 rounded-xl p-4">
                        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-300/80">
                          Your account uses Google Sign-In. Password changes are not available for OAuth accounts.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPwError(null);
                        }}
                        disabled={user?.is_oauth}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm font-mono disabled:opacity-40"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPwError(null);
                        }}
                        disabled={user?.is_oauth}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 p-4 rounded-xl text-white outline-none transition-all placeholder:text-slate-700 text-sm font-mono disabled:opacity-40"
                      />
                      <p className="text-[10px] text-slate-600">
                        Min. 8 chars · 1 uppercase · 1 digit
                      </p>
                    </div>

                    {pwError && (
                      <p className="text-red-400 text-xs flex items-center gap-2">
                        <AlertTriangle size={12} /> {pwError}
                      </p>
                    )}

                    {pwSuccess && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-emerald-400 text-xs flex items-center gap-2"
                      >
                        <CheckCircle2 size={12} /> Password changed successfully.
                      </motion.p>
                    )}

                    <button
                      onClick={handlePasswordUpdate}
                      disabled={pwLoading || !!user?.is_oauth}
                      className="w-full py-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-400/50 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {pwLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <KeyRound size={14} />
                      )}
                      Change Password
                    </button>
                  </motion.div>
                )}

                {/* ── DANGER TAB ── */}
                {activeTab === "danger" && (
                  <motion.div
                    key="danger"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-5"
                  >
                    {/* Warning banner */}
                    <div className="flex items-start gap-3 bg-red-950/30 border border-red-500/30 rounded-xl p-4">
                      <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-red-400 uppercase tracking-widest">
                          Irreversible Action
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Deleting your account will permanently deactivate it. Your order history will be
                          preserved but your profile will be inaccessible.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Type{" "}
                        <span className="text-red-400 font-mono">DELETE</span>{" "}
                        to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) => {
                          setDeleteConfirm(e.target.value);
                          setDeleteError(null);
                        }}
                        placeholder="DELETE"
                        className="w-full bg-black/40 border border-red-500/20 focus:border-red-500/50 p-4 rounded-xl text-red-300 outline-none transition-all placeholder:text-slate-700 text-sm font-mono"
                      />
                    </div>

                    {deleteError && (
                      <p className="text-red-400 text-xs flex items-center gap-2">
                        <AlertTriangle size={12} /> {deleteError}
                      </p>
                    )}

                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading || deleteConfirm !== "DELETE"}
                      className="w-full py-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/40 hover:border-red-400/60 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deleteLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Permanently Delete Account
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
