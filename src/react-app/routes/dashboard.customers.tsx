import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

export const Route = createFileRoute("/dashboard/customers")({
  component: RouteComponent,
});

interface Customer {
  id: string;
  name: string;
  email: string;
  image_url?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateCustomerData {
  name: string;
  email: string;
  image_url: string;
}

interface EditCustomerData {
  name: string;
  email: string;
  image_url: string;
}

function RouteComponent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Dialog states
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Form states
  const [createCustomerData, setCreateCustomerData] =
    useState<CreateCustomerData>({
      name: "",
      email: "",
      image_url: "",
    });
  const [editCustomerData, setEditCustomerData] = useState<EditCustomerData>({
    name: "",
    email: "",
    image_url: "",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customers", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async () => {
    if (!createCustomerData.name || !createCustomerData.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: createCustomerData.name,
          email: createCustomerData.email,
          image_url: createCustomerData.image_url || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create customer");
      }

      toast.success("Customer created successfully");
      setAddCustomerOpen(false);
      setCreateCustomerData({ name: "", email: "", image_url: "" });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to create customer:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create customer"
      );
    }
  };

  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;

    if (!editCustomerData.name || !editCustomerData.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editCustomerData.name,
          email: editCustomerData.email,
          image_url: editCustomerData.image_url || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update customer");
      }

      toast.success("Customer updated successfully");
      setEditCustomerOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update customer"
      );
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this customer? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      toast.success("Customer deleted successfully");
      fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error("Please select customers to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedRows.length} customers? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const customerIds = selectedRows.map((row) => row.original.id);

      for (const customerId of customerIds) {
        await fetch(`/api/customers/${customerId}`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      toast.success(`Deleted ${customerIds.length} customers successfully`);
      setRowSelection({});
      fetchCustomers();
    } catch (error) {
      console.error("Failed to perform bulk delete:", error);
      toast.error("Failed to perform bulk delete");
    }
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditCustomerData({
      name: customer.name,
      email: customer.email,
      image_url: customer.image_url || "",
    });
    setEditCustomerOpen(true);
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

  const columns: ColumnDef<Customer>[] = [
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
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-3">
            {customer.image_url ? (
              <img
                src={customer.image_url}
                alt={customer.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                {customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{customer.name}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.getValue("createdAt"))}</div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.getValue("updatedAt"))}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteCustomer(customer.id)}
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
    data: customers,
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
        <h1 className="text-2xl font-semibold">Customer Management</h1>
        <p className="text-muted-foreground text-sm">
          Manage customers in your application
        </p>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>
                {table.getFilteredRowModel().rows.length} total customers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Drawer
                open={addCustomerOpen}
                onOpenChange={setAddCustomerOpen}
                direction="right"
              >
                <DrawerTrigger asChild>
                  <Button>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="w-full max-w-md h-full max-h-screen overflow-y-auto">
                  <DrawerHeader className="pb-4">
                    <DrawerTitle>Create New Customer</DrawerTitle>
                    <DrawerDescription>
                      Add a new customer to the system.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="space-y-4 px-6 pb-6">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={createCustomerData.name}
                        onChange={(e) =>
                          setCreateCustomerData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createCustomerData.email}
                        onChange={(e) =>
                          setCreateCustomerData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Enter customer email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image_url">Image URL (optional)</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={createCustomerData.image_url}
                        onChange={(e) =>
                          setCreateCustomerData((prev) => ({
                            ...prev,
                            image_url: e.target.value,
                          }))
                        }
                        placeholder="Enter image URL"
                      />
                    </div>
                  </div>
                  <DrawerFooter className="px-6 pt-4 border-t">
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        onClick={() => setAddCustomerOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCustomer} className="flex-1">
                        Create Customer
                      </Button>
                    </div>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search customers..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
              />
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
                variant="destructive"
                onClick={handleBulkDelete}
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
                      {loading ? "Loading..." : "No customers found."}
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

      {/* Edit Customer Dialog */}
      <Drawer
        open={editCustomerOpen}
        onOpenChange={setEditCustomerOpen}
        direction="right"
      >
        <DrawerContent className="w-full max-w-md h-full max-h-screen overflow-y-auto">
          <DrawerHeader className="pb-4">
            <DrawerTitle>Edit Customer</DrawerTitle>
            <DrawerDescription>
              Update customer information.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 px-6 pb-6">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editCustomerData.name}
                onChange={(e) =>
                  setEditCustomerData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editCustomerData.email}
                onChange={(e) =>
                  setEditCustomerData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image_url">Image URL (optional)</Label>
              <Input
                id="edit-image_url"
                type="url"
                value={editCustomerData.image_url}
                onChange={(e) =>
                  setEditCustomerData((prev) => ({
                    ...prev,
                    image_url: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DrawerFooter className="px-6 pt-4 border-t">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setEditCustomerOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleEditCustomer} className="flex-1">
                Save Changes
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
