import StatCard from "@/components/shared/StatCard";

const { UserCog2, GraduationCap, Users } = require("lucide-react");

export default function StatesSection({ stats, loading }) {
    const statCards = [
        {
            title: "Total Teachers",
            value: loading ? '...' : stats.totalTeachers,
            subtitle: "Active teachers",
            icon: <UserCog2 className="h-5 w-5" />,
            bgColor: 'bg-[#0E9EAD]/10',
            iconColor: 'text-[#0E9EAD]'
        },
        {
            title: "Total Students",
            value: loading ? '...' : stats.totalStudents,
            subtitle: "Active students",
            icon: <GraduationCap className="h-5 w-5" />,
            bgColor: 'bg-[#2EAF4D]/10',
            iconColor: 'text-[#2EAF4D]',
        },
        {
            title: "Total Parents",
            value: loading ? '...' : stats.totalParents,
            subtitle: "Active parents",
            icon: <Users className="h-5 w-5" />,
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
            iconColor: 'text-orange-500',
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statCards.map((card, index) => (
                <StatCard
                    key={index}
                    title={card.title}
                    value={card.value}
                    subtitle={card.subtitle}
                    icon={card.icon}
                    bgColor={card.bgColor}
                    iconColor={card.iconColor}
                />
            ))}
        </div>
    )
}


