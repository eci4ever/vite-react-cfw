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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

export const Route = createFileRoute("/dashboard/invoices")({
  component: RouteComponent,
});

interface Invoice {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  date: string;
  status: "pending" | "paid";
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface CreateInvoiceData {
  customer_id: string;
  amount: string;
  date: string;
  status: "pending" | "paid";
}

interface EditInvoiceData {
  customer_id: string;
  amount: string;
  date: string;
  status: "pending" | "paid";
}

function RouteComponent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Dialog states
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [editInvoiceOpen, setEditInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form states
  const [createInvoiceData, setCreateInvoiceData] =
    useState<CreateInvoiceData>({
      customer_id: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    });
  const [editInvoiceData, setEditInvoiceData] = useState<EditInvoiceData>({
    customer_id: "",
    amount: "",
    date: "",
    status: "pending",
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/invoices", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
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
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const handleCreateInvoice = async () => {
    if (
      !createInvoiceData.customer_id ||
      !createInvoiceData.amount ||
      !createInvoiceData.date
    ) {
      toast.error("Customer, amount, and date are required");
      return;
    }

    const amount = parseFloat(createInvoiceData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          customer_id: createInvoiceData.customer_id,
          amount: amount,
          date: new Date(createInvoiceData.date).toISOString(),
          status: createInvoiceData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }

      toast.success("Invoice created successfully");
      setAddInvoiceOpen(false);
      setCreateInvoiceData({
        customer_id: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        status: "pending",
      });
      fetchInvoices();
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create invoice"
      );
    }
  };

  const handleEditInvoice = async () => {
    if (!selectedInvoice) return;

    if (
      !editInvoiceData.customer_id ||
      !editInvoiceData.amount ||
      !editInvoiceData.date
    ) {
      toast.error("Customer, amount, and date are required");
      return;
    }

    const amount = parseFloat(editInvoiceData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }

    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          customer_id: editInvoiceData.customer_id,
          amount: amount,
          date: new Date(editInvoiceData.date).toISOString(),
          status: editInvoiceData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update invoice");
      }

      toast.success("Invoice updated successfully");
      setEditInvoiceOpen(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update invoice"
      );
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      toast.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error("Please select invoices to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedRows.length} invoices? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const invoiceIds = selectedRows.map((row) => row.original.id);

      for (const invoiceId of invoiceIds) {
        await fetch(`/api/invoices/${invoiceId}`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      toast.success(`Deleted ${invoiceIds.length} invoices successfully`);
      setRowSelection({});
      fetchInvoices();
    } catch (error) {
      console.error("Failed to perform bulk delete:", error);
      toast.error("Failed to perform bulk delete");
    }
  };

  const openEditDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditInvoiceData({
      customer_id: invoice.customer_id,
      amount: invoice.amount.toString(),
      date: new Date(invoice.date).toISOString().split("T")[0],
      status: invoice.status,
    });
    setEditInvoiceOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const columns: ColumnDef<Invoice>[] = [
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
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div>
            <div className="font-medium">{invoice.customer_name}</div>
            <div className="text-sm text-muted-foreground">
              {invoice.customer_email}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">{formatCurrency(row.getValue("amount"))}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.getValue("date"))}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.getValue("createdAt"))}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(invoice)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteInvoice(invoice.id)}
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
    data: invoices,
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
        <h1 className="text-2xl font-semibold">Invoice Management</h1>
        <p className="text-muted-foreground text-sm">
          Manage invoices for your customers
        </p>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                {table.getFilteredRowModel().rows.length} total invoices
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Drawer
                open={addInvoiceOpen}
                onOpenChange={setAddInvoiceOpen}
                direction="right"
              >
                <DrawerTrigger asChild>
                  <Button>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add Invoice
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="w-full max-w-md h-full max-h-screen overflow-y-auto">
                  <DrawerHeader className="pb-4">
                    <DrawerTitle>Create New Invoice</DrawerTitle>
                    <DrawerDescription>
                      Add a new invoice to the system.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="space-y-4 px-6 pb-6">
                    <div className="grid gap-2">
                      <Label htmlFor="customer">Customer</Label>
                      <Select
                        value={createInvoiceData.customer_id}
                        onValueChange={(value) =>
                          setCreateInvoiceData((prev) => ({
                            ...prev,
                            customer_id: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} ({customer.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={createInvoiceData.amount}
                        onChange={(e) =>
                          setCreateInvoiceData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={createInvoiceData.date}
                        onChange={(e) =>
                          setCreateInvoiceData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={createInvoiceData.status}
                        onValueChange={(value: "pending" | "paid") =>
                          setCreateInvoiceData((prev) => ({
                            ...prev,
                            status: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DrawerFooter className="px-6 pt-4 border-t">
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        onClick={() => setAddInvoiceOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateInvoice} className="flex-1">
                        Create Invoice
                      </Button>
                    </div>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search invoices..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={
                  (table.getColumn("status")?.getFilterValue() as string) ?? ""
                }
                onValueChange={(value) =>
                  table
                    .getColumn("status")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
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
                      {loading ? "Loading..." : "No invoices found."}
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

      {/* Edit Invoice Dialog */}
      <Drawer
        open={editInvoiceOpen}
        onOpenChange={setEditInvoiceOpen}
        direction="right"
      >
        <DrawerContent className="w-full max-w-md h-full max-h-screen overflow-y-auto">
          <DrawerHeader className="pb-4">
            <DrawerTitle>Edit Invoice</DrawerTitle>
            <DrawerDescription>Update invoice information.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 px-6 pb-6">
            <div className="grid gap-2">
              <Label htmlFor="edit-customer">Customer</Label>
              <Select
                value={editInvoiceData.customer_id}
                onValueChange={(value) =>
                  setEditInvoiceData((prev) => ({
                    ...prev,
                    customer_id: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0"
                value={editInvoiceData.amount}
                onChange={(e) =>
                  setEditInvoiceData((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editInvoiceData.date}
                onChange={(e) =>
                  setEditInvoiceData((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editInvoiceData.status}
                onValueChange={(value: "pending" | "paid") =>
                  setEditInvoiceData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter className="px-6 pt-4 border-t">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setEditInvoiceOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleEditInvoice} className="flex-1">
                Save Changes
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
