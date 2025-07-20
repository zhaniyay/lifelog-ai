'use client'

import { FileText, Mic, Image, TrendingUp } from 'lucide-react'

export function StatsCards() {
  // Mock data - in real app, this would come from API
  const stats = [
    {
      name: 'Total Entries',
      value: '24',
      change: '+12%',
      changeType: 'increase',
      icon: FileText,
    },
    {
      name: 'Audio Files',
      value: '8',
      change: '+3',
      changeType: 'increase',
      icon: Mic,
    },
    {
      name: 'Images',
      value: '12',
      change: '+5',
      changeType: 'increase',
      icon: Image,
    },
    {
      name: 'This Week',
      value: '7',
      change: '+2',
      changeType: 'increase',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
