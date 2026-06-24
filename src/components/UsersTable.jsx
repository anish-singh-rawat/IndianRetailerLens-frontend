import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, } from "@tanstack/react-table";
import { FiTrash2 } from "react-icons/fi";
import api from "../utils/api";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

export default function UsersTable({ users, loading, refresh }) {

    const permissions = useSelector((state) => state.auth.user.permissions);  // loggedin user permissions

    const columnHelper = createColumnHelper();

    const columns = [
        columnHelper.accessor("name", { header: "Name" }),
        columnHelper.accessor("mobile", { header: "Mobile" }),
        columnHelper.accessor("email", { header: "Email" }),
        columnHelper.accessor("designation", { header: "Designation" }),
        columnHelper.accessor("commission", { header: "Commission %" }),

        ...(permissions?.includes("DELETE USER")
            ? [
                columnHelper.display({
                    id: "actions",
                    header: "Actions",
                    cell: ({ row }) => (
                        <button
                            onClick={async () => {
                                const result = await Swal.fire({
                                    title: "Are you sure?",
                                    text: "This user will be deleted!",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#ea580c",
                                    cancelButtonColor: "#6b7280",
                                    confirmButtonText: "Yes, delete it!",
                                });

                                if (result.isConfirmed) {
                                    try {
                                        await api.delete(
                                            `/users/delete-user/${row.original._id}`
                                        );

                                        await Swal.fire({
                                            title: "Deleted!",
                                            text: "User has been deleted.",
                                            icon: "success",
                                            confirmButtonColor: "#ea580c",
                                        });

                                        refresh();
                                    } catch (error) {
                                        Swal.fire({
                                            title: "Error!",
                                            text:
                                                error.response?.data?.error ||
                                                "Something went wrong",
                                            icon: "error",
                                        });
                                    }
                                }
                            }}
                            className="text-red-600 cursor-pointer font-medium hover:text-red-800"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    ),
                }),
            ]
            : []),
    ];

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="bg-white shadow-lg rounded-2xl p-5">
            <h2 className="font-semibold text-lg mb-4">All Users</h2>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="w-full text-sm">
                    <thead className="bg-orange-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="p-3 text-center">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-b hover:bg-gray-50">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-3 text-center">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
