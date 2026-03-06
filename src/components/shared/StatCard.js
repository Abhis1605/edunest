import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function StatCard({ title, value, subtitle, icon, bgColor, iconColor}) {
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium text-gray-500'>
                    {title}
                </CardTitle>
                <div className={`p-2 ${bgColor} rounded-full`}>
                    <div className={iconColor} >
                        {icon}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-gray-800">
                    {value ?? '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {subtitle}
                </p>
            </CardContent>
        </Card>
    )
}