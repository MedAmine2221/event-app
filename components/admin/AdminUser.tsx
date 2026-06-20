/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";;
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Edit2, Trash2, Shield, User, Plus, X } from "lucide-react";

const colors = {
  primary: "#C3937C",
  secondary: "#EAD9C9",
  background: "#FBF8F1",
  textDark: "#2C2C2C",
  textLight: "#787878",
};

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

interface NewUser {
  email: string;
  password: string;
  displayName: string;
  role: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    password: "",
    displayName: "",
    role: "client"
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);
const deleteUser = async (userId: string) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur suppression");

    setUsers(prev => prev.filter(u => u.id !== userId));
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la suppression");
  }
};

const updateUserRole = async (userId: string, newRole: string) => {
  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (!res.ok) throw new Error("Erreur mise à jour");

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setEditingUser(null);
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la mise à jour");
  }
};
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

const addNewUser = async () => {
  setAddUserError("");

  if (!newUser.email || !newUser.password || !newUser.displayName) {
    setAddUserError("Tous les champs sont requis");
    return;
  }
  if (newUser.password.length < 6) {
    setAddUserError("Le mot de passe doit contenir au moins 6 caractères");
    return;
  }

  setAddUserLoading(true);

  try {
    const res = await fetch("/api/admin/users/add-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur création");

    setUsers((prev) => [
      ...prev,
      {
        id: data.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        createdAt: new Date().toISOString(),
      },
    ]);

    setNewUser({ email: "", password: "", displayName: "", role: "client" });
    setShowAddModal(false);
  } catch (error: any) {
    setAddUserError(error.message || "Erreur lors de la création du compte");
  } finally {
    setAddUserLoading(false);
  }
};


  if (loading) {
    return <div className="text-center py-10">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: colors.textDark }}>
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textLight }}>
            Gérez les comptes utilisateurs et leurs rôles
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: colors.primary, color: "white" }}
        >
          <Plus size={18} />
          Ajouter un client
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: `${colors.primary}10` }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textDark }}>Nom</th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textDark }}>Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textDark }}>Rôle</th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textDark }}>Date création</th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textDark }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: `${colors.textLight}20` }}>
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm" style={{ color: colors.textDark }}>{user.displayName || "—"}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.textLight }}>{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    {editingUser?.id === user.id ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                        className="px-2 py-1 rounded border text-sm"
                        style={{ borderColor: colors.primary }}
                      >
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {user.role === "admin" ? <Shield size={12} className="inline mr-1" /> : <User size={12} className="inline mr-1" />}
                        {user.role === "admin" ? "Admin" : "Client"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.textLight }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {editingUser?.id === user.id ? (
                        <>
                          <button
                            onClick={() => updateUserRole(user.id, editingUser.role)}
                            className="p-1 rounded hover:bg-green-100 transition-colors"
                            style={{ color: "#10B981" }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="p-1 rounded hover:bg-red-100 transition-colors"
                            style={{ color: "#EF4444" }}
                          >
                            ✗
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            style={{ color: colors.primary }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="p-1 rounded hover:bg-red-100 transition-colors"
                            style={{ color: "#EF4444" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium" style={{ color: colors.textDark }}>
                Ajouter un nouveau client
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddUserError("");
                  setNewUser({
                    email: "",
                    password: "",
                    displayName: "",
                    role: "client"
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: `${colors.primary}50`, focusRing: colors.primary }}
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: `${colors.primary}50` }}
                  placeholder="client@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: `${colors.primary}50` }}
                  placeholder="Min. 6 caractères"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  Rôle *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: `${colors.primary}50` }}
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {addUserError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {addUserError}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={addNewUser}
                  disabled={addUserLoading}
                  className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                >
                  {addUserLoading ? "Création..." : "Créer le compte"}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddUserError("");
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border transition-all hover:bg-gray-50"
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};