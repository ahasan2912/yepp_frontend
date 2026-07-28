import { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useGetShopChatsQuery } from '../../../../features/shop/shopApi';
import PersonalOverviewSkeleton from '../../../../components/skeleton/PersonalOverviewSkeleton';

const Charts = () => {
    const [type, setType] = useState('views');
    const { data: chatData, isLoading } = useGetShopChatsQuery('2026');

    if (isLoading) {
        return <PersonalOverviewSkeleton />;
    }

    const rawData = chatData?.data || [];

    // Get last 30 days, sorted oldest → newest (left → right on chart)
    const formattedData = [...rawData]
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateA - dateB;
        })
        .slice(-30)
        .map((item) => ({
            name: new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            }),
            views: item.views ?? 0,
            impressions: item.impressions ?? 0,
        }));

    return (
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 sm:space-y-2">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                        Ad Performance
                    </h2>
                    <span className="inline-flex rounded-full bg-[#E8F8FB] px-2.5 py-1 text-xs sm:text-sm font-semibold text-primary">
                        Last 30 days
                    </span>
                </div>
                <div className="w-full sm:w-auto">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full rounded-lg border border-[#D4EEF3] bg-[#F8FCFD] px-2.5 py-2 text-xs sm:px-3 sm:py-2.5 sm:text-sm font-semibold text-[#262626] shadow-sm outline-none transition-all duration-200 hover:border-[#4BBDCF] focus:border-primary focus:ring-2 focus:ring-primary/25 cursor-pointer sm:w-36"
                    >
                        <option value="views">Views</option>
                        <option value="impressions">Impressions</option>
                    </select>
                </div>
            </div>
            <div className="w-full h-64 sm:h-80 md:h-87.5 lg:h-100">
                {formattedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formattedData}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4BBDCF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4BBDCF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey={type}
                                stroke="#4BBDCF"
                                strokeWidth={3}
                                fill="url(#colorViews)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        No analytics data available for the last 30 days.
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-3 sm:mt-4 gap-2 items-center text-xs sm:text-sm text-gray-500">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-[#4BBDCF]"></span>
                Daily trend for the last 30 days
            </div>
        </div>
    );
};

export default Charts;
