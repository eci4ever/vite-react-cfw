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
  id: number;
  name: string;
  age: number;
  email: string;
}

interface UserFormData {
  name: string;
  age: number;
  email: string;
}

// API functions
const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

const createUser = async (data: UserFormData): Promise<User> => {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create user");
  }
  return response.json();
};

const updateUser = async ({
  id,
  ...data
}: UserFormData & { id: number }): Promise<User> => {
  const response = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }
  return response.json();
};

const deleteUser = async (userId: number): Promise<void> => {
  const response = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }
};

function Users() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    age: 0,
    email: "",
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
      setFormData({ name: "", age: 0, email: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      setFormData({ name: "", age: 0, email: "" });
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

  const handleDelete = (userId: number) => {
    deleteMutation.mutate(userId);
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      age: user.age,
      email: user.email,
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setShowCreateForm(false);
    setFormData({ name: "", age: 0, email: "" });
  };

  const startCreate = () => {
    setShowCreateForm(true);
    setEditingUser(null);
    setFormData({ name: "", age: 0, email: "" });
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
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter age"
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
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingUser ? handleUpdate : handleCreate}
                disabled={
                  !formData.name ||
                  !formData.email ||
                  formData.age <= 0 ||
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
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Age</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-right py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.id}</td>
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4">{user.age}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
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
