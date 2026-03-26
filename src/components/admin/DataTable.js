import Spinner from "../shared/Spinner";
import { Card, CardContent } from "../ui/card";
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

    const actionCol = columns.find(c => c.key === 'actions')
    const dataColumns = columns.filter(c => c.key !== 'actions')

    return(
        <>
            <div className=" hidden  lg:block overflow-x-auto">
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

        {/* Mobile and tablet cards */}
 <div className="lg:hidden space-y-3">
                {data.map((row, i) => (
                    <Card key={row._id || i}>
                        <CardContent className="p-4 space-y-2">

                            {dataColumns.map((col) => (
                                <div key={col.key}
                                    className="flex items-start gap-2">
                                    <span className="text-xs font-medium
                                    text-muted-foreground shrink-0 w-24">
                                        {col.label}
                                    </span>
                                    <div className="flex-1 min-w-0
                                    text-right">
                                        <div className="text-sm
                                        text-foreground truncate">
                                            {col.render
                                                ? col.render(row)
                                                : row[col.key]
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {actionCol && (
                                <div className="pt-2 border-t
                                border-border flex justify-end">
                                    {actionCol.render(row)}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    )
}