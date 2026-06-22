"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Colors for status distribution
const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "#9ca3af", // gray
  IN_PROGRESS: "#3b82f6",  // blue
  COMPLETED: "#22c55e",    // green
  BEHIND: "#ef4444",       // red
  FAST_PACED: "#a855f7",   // purple
  PUT_TO_REVISE: "#f59e0b", // amber
};

const LEGEND_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BEHIND: "Behind",
  FAST_PACED: "Fast Paced",
  PUT_TO_REVISE: "Put to Revise",
};

export function OverallProgressChart({ overall, studying, revision }: { overall: number; studying: number; revision: number }) {
  const data = [
    { name: "Overall", Progress: overall, Left: 100 - overall },
    { name: "Studying Phase", Progress: studying, Left: 100 - studying },
    { name: "Revision Phase", Progress: revision, Left: 100 - revision },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Preparation Progress Split</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="Progress" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Progress Completion" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SubjectProgressChart({ data }: { data: { subject: string; progress: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Subject Progress</CardTitle></CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} interval={0} fontSize={10} />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="progress" fill="#22c55e" radius={[4, 4, 0, 0]} name="Progress %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SubtopicStatusDistributionChart({ data }: { data: { status: string; count: number }[] }) {
  const pieData = data.filter(d => d.count > 0).map(d => ({
    name: LEGEND_LABELS[d.status] || d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] || "#6b7280",
  }));

  return (
    <Card>
      <CardHeader><CardTitle>Syllabus Status Distribution</CardTitle></CardHeader>
      <CardContent className="h-80 flex items-center justify-center">
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">No data available.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DailyCompletionChart({ data }: { data: { day: string; completion: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Daily Tasks Completion Trend</CardTitle></CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" hide />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Line type="monotone" dataKey="completion" stroke="#3b82f6" strokeWidth={2} dot={false} name="Completion Rate" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function MockScoreTrendChart({ data }: { data: { date: string; scorePercentage: number; title: string }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Mock Test Performance Trend</CardTitle></CardHeader>
      <CardContent className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={10} />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip labelFormatter={(label) => `Date: ${label}`} formatter={(value, name, props) => [`${value}%`, `Test: ${props.payload.title}`]} />
              <Line type="monotone" dataKey="scorePercentage" stroke="#f59e0b" strokeWidth={2.5} activeDot={{ r: 8 }} name="Marks Percentage" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No mock tests logged yet. History appears here after adding tests.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BehindVsCompletedChart({ behind, completed, total }: { behind: number; completed: number; total: number }) {
  const left = Math.max(total - behind - completed, 0);
  const data = [
    { name: "Completed", count: completed, color: "#22c55e" },
    { name: "Behind", count: behind, color: "#ef4444" },
    { name: "Remaining Tasks", count: left, color: "#9ca3af" },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Tasks Balance (Behind vs Completed)</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function StudyTimeChart({ data }: { data: { date: string; minutes: number; tasks: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Minutes Studied (Last 30 Days)</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(-30)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" hide />
            <YAxis />
            <Tooltip labelFormatter={(label) => `Date: ${label}`} formatter={(value) => [`${value} mins`, "Studied"]} />
            <Bar dataKey="minutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Study Time" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
