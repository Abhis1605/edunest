import Spinner from "../shared/Spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export default function DataTable({
    columns, data, loading, emptyMessage
}) {
    if (loading) return <Spinner />

    if (data.length === 0) {
        return(
            <p className="text-muted-foreground text-sm text-center py-8">{emptyMessage || "No data found."}</p>
        )
    }

    return(
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.key}>
                                {col.label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    { data.map((row, index) => (
                        <TableRow key={row._id || index}>
                            {columns.map((col) => (
                                <TableCell key={col.key}>
                                    {col.render ? col.render(row) : row[col.key]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}