'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SkillProgressData {
  skillName: string;
  progress: number;
  timeSpent: number;
  difficulty: 'introduction' | 'development' | 'refinement';
  completed: boolean;
}

interface SkillProgressChartProps {
  data: SkillProgressData[];
  title?: string;
  description?: string;
}

export function SkillProgressChart({
  data,
  title = "Skills Progress",
  description = "Your progress across different skills"
}: SkillProgressChartProps) {
  const getBarColor = (difficulty: string, completed: boolean) => {
    if (completed) return 'hsl(142, 76%, 36%)'; // Green for completed

    switch (difficulty) {
      case 'introduction':
        return 'hsl(210, 40%, 70%)'; // Light blue
      case 'development':
        return 'hsl(45, 93%, 47%)'; // Orange
      case 'refinement':
        return 'hsl(0, 84%, 60%)'; // Red
      default:
        return 'hsl(210, 40%, 70%)';
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Chart View */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="skillName"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as SkillProgressData;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="grid gap-2">
                            <div className="font-medium">{label}</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Progress:</span>
                                <span className="ml-1 font-medium">{data.progress}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Time:</span>
                                <span className="ml-1 font-medium">{data.timeSpent}h</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Difficulty:</span>
                                <span className="ml-1 font-medium capitalize">{data.difficulty}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>
                                <span className="ml-1 font-medium">
                                  {data.completed ? 'Completed' : 'In Progress'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.difficulty, entry.completed)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Progress List View */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Detailed Progress</h4>
            <div className="space-y-3">
              {data.map((skill, index) => (
                <div key={index} className="flex items-center space-x-4 rounded-lg border p-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">{skill.skillName}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          skill.difficulty === 'introduction'
                            ? 'bg-blue-50 text-blue-700 ring-blue-700/10'
                            : skill.difficulty === 'development'
                            ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                            : 'bg-red-50 text-red-700 ring-red-700/10'
                        }`}>
                          {skill.difficulty}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {skill.progress}%
                        </span>
                      </div>
                    </div>
                    <Progress value={skill.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {skill.timeSpent}h spent • {skill.completed ? 'Completed' : 'In Progress'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}