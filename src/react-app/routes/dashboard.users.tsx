import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconBan,
  IconUserCheck,
  IconRefresh,
} from "@tabler/icons-react";

export const Route = createFileRoute("/dashboard/users")({
  component: RouteComponent,
});

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  role?: string;
  banned: boolean;
  banReason?: string;
  banExpires?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

interface EditUserData {
  name: string;
  email: string;
  role: "user" | "admin";
}

function RouteComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Dialog states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [editUserData, setEditUserData] = useState<EditUserData>({
    name: "",
    email: "",
    role: "user",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authClient.admin.listUsers({
        query: {
          limit: 1000, // Get all users for now
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });

      if (response.data) {
        setUsers(response.data.users as User[]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      await authClient.admin.createUser({
        name: createUserData.name,
        email: createUserData.email,
        password: createUserData.password,
        role: createUserData.role,
      });

      toast.success("User created successfully");
      setAddUserOpen(false);
      setCreateUserData({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create user");
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await authClient.admin.updateUser({
        userId: selectedUser.id,
        data: {
          name: editUserData.name,
          email: editUserData.email,
          role: editUserData.role,
        },
      });

      toast.success("User updated successfully");
      setEditUserOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleBanUser = async (userId: string, banReason?: string) => {
    try {
      await authClient.admin.banUser({
        userId,
        banReason: banReason || "Administrative action",
      });
      toast.success("User banned successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to ban user:", error);
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await authClient.admin.unbanUser({ userId });
      toast.success("User unbanned successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to unban user:", error);
      toast.error("Failed to unban user");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await authClient.admin.removeUser({ userId });
      toast.success("User removed successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to remove user:", error);
      toast.error("Failed to remove user");
    }
  };

  const handleRevokeSessions = async (userId: string) => {
    try {
      await authClient.admin.revokeUserSessions({ userId });
      toast.success("User sessions revoked successfully");
    } catch (error) {
      console.error("Failed to revoke user sessions:", error);
      toast.error("Failed to revoke user sessions");
    }
  };

  const handleBulkAction = async (action: "ban" | "unban" | "delete") => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error("Please select users to perform bulk action");
      return;
    }

    const userIds = selectedRows.map((row) => row.original.id);

    try {
      for (const userId of userIds) {
        switch (action) {
          case "ban":
            await authClient.admin.banUser({
              userId,
              banReason: "Bulk administrative action",
            });
            break;
          case "unban":
            await authClient.admin.unbanUser({ userId });
            break;
          case "delete":
            await authClient.admin.removeUser({ userId });
            break;
        }
      }

      toast.success(`${action} action completed for ${userIds.length} users`);
      setRowSelection({});
      fetchUsers();
    } catch (error) {
      console.error(`Failed to perform bulk ${action}:`, error);
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      role: (user.role as "user" | "admin") || "user",
    });
    setEditUserOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "user":
        return "secondary";
      default:
        return "outline";
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">
                {user.emailVerified ? "Verified" : "Unverified"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email"),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant={getRoleBadgeVariant(role)}>{role || "user"}</Badge>
        );
      },
    },
    {
      accessorKey: "banned",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        return user.banned ? (
          <Badge variant="destructive">
            Banned
            {user.banReason && (
              <span className="ml-1 text-xs">({user.banReason})</span>
            )}
          </Badge>
        ) : (
          <Badge variant="secondary">Active</Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRevokeSessions(user.id)}>
                <IconRefresh className="mr-2 h-4 w-4" />
                Revoke Sessions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.banned ? (
                <DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
                  <IconUserCheck className="mr-2 h-4 w-4" />
                  Unban
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleBanUser(user.id)}>
                  <IconBan className="mr-2 h-4 w-4" />
                  Ban
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleRemoveUser(user.id)}
                className="text-destructive"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-muted-foreground text-sm">
          Manage users, roles, and permissions in your application
        </p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {table.getFilteredRowModel().rows.length} total users
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Dialog
                open={addUserOpen}
                onOpenChange={setAddUserOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system with appropriate permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={createUserData.name}
                        onChange={(e) =>
                          setCreateUserData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter user name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createUserData.email}
                        onChange={(e) =>
                          setCreateUserData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Enter user email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={createUserData.password}
                        onChange={(e) =>
                          setCreateUserData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={createUserData.role}
                        onValueChange={(value: "user" | "admin") =>
                          setCreateUserData((prev) => ({
                            ...prev,
                            role: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddUserOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser}>
                      Create User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={
                  (table.getColumn("role")?.getFilterValue() as string) ?? ""
                }
                onValueChange={(value) =>
                  table
                    .getColumn("role")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={
                  (table.getColumn("banned")?.getFilterValue() as string) ?? ""
                }
                onValueChange={(value) =>
                  table
                    .getColumn("banned")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="false">Active</SelectItem>
                  <SelectItem value="true">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("ban")}
              >
                Ban Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("unban")}
              >
                Unban Selected
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction("delete")}
              >
                Delete Selected
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {loading ? "Loading..." : "No users found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog
        open={editUserOpen}
        onOpenChange={setEditUserOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editUserData.name}
                onChange={(e) =>
                  setEditUserData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserData.email}
                onChange={(e) =>
                  setEditUserData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editUserData.role}
                onValueChange={(value: "user" | "admin") =>
                  setEditUserData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditUserOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
