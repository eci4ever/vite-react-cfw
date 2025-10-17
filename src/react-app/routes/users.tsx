import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus, X, Check, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/users")({
  loader: async () => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({ to: "/" });
    }
  },
  component: Users,
});

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

// API functions using Better Auth admin client
const fetchUsers = async (): Promise<User[]> => {
  const response = await authClient.admin.listUsers({
    query: {},
  });
  if (!response.data) {
    throw new Error("Failed to fetch users");
  }
  // The response.data contains users array and pagination info
  return response.data.users || [];
};

const createUser = async (data: UserFormData): Promise<User> => {
  const response = await authClient.admin.createUser({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role as "user" | "admin",
  });
  if (!response.data) {
    throw new Error(response.error?.message || "Failed to create user");
  }
  return response.data.user;
};

const updateUser = async ({
  id,
  ...data
}: UserFormData & { id: string }): Promise<User> => {
  const response = await authClient.admin.updateUser({
    userId: id,
    data: {
      name: data.name,
      email: data.email,
      role: data.role as "user" | "admin",
    },
  });
  if (!response.data) {
    throw new Error(response.error?.message || "Failed to update user");
  }
  return response.data;
};

const deleteUser = async (userId: string): Promise<void> => {
  const response = await authClient.admin.removeUser({
    userId: userId,
  });
  if (!response.data) {
    throw new Error(response.error?.message || "Failed to delete user");
  }
};

function Users() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // Queries
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowCreateForm(false);
      setFormData({ name: "", email: "", password: "", role: "user" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: "user" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteConfirmId(null);
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        ...formData,
      });
    }
  };

  const handleDelete = (userId: string) => {
    deleteMutation.mutate(userId);
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't populate password for editing
      role: user.role || "user",
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setShowCreateForm(false);
    setFormData({ name: "", email: "", password: "", role: "user" });
  };

  const startCreate = () => {
    setShowCreateForm(true);
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "user" });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading users: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            Users
          </h1>
          <p className="text-gray-600 mt-1">Manage your user database</p>
        </div>
        <Button onClick={startCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingUser) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingUser ? "Edit User" : "Add New User"}</CardTitle>
            <CardDescription>
              {editingUser
                ? "Update user information"
                : "Enter the details for the new user"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password{" "}
                  {!editingUser ? "*" : "(leave blank to keep current)"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingUser ? "Enter new password" : "Enter password"
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingUser ? handleUpdate : handleCreate}
                disabled={
                  !formData.name ||
                  !formData.email ||
                  (!editingUser && !formData.password) ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                {editingUser ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
            {(createMutation.error || updateMutation.error) && (
              <div className="text-red-600 text-sm">
                {createMutation.error?.message || updateMutation.error?.message}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found. Click "Add User" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {/* <th className="text-left py-3 px-4 font-medium">ID</th> */}
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Verified
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      {/* <td className="py-3 px-4">{user.id}</td> */}
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.emailVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(user)}
                            disabled={editingUser?.id === user.id}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirmId(user.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-red-600">Delete User</CardTitle>
              <CardDescription>
                Are you sure you want to delete this user? This action cannot be
                undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
              {deleteMutation.error && (
                <div className="text-red-600 text-sm mt-2">
                  {deleteMutation.error.message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
