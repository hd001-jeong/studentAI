import { Card, Typography } from "antd";
import {
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { LessonRecord } from "@/types/lessonRecord";

const { Text } = Typography;

interface StudentProgressChartProps {
  records?: LessonRecord[];
}

export default function StudentProgressChart({
  records = [],
}: StudentProgressChartProps) {
  if (records.length === 0) {
    return null;
  }

  const chartData = records.map((record) => ({
    weekLabel: record.weekLabel,
    dailyAverage: record.dailyAchievement,
    homeworkAverage: record.homeworkAchievement,
    reviewScore: record.reviewTestScore,
  }));

  return (
    <Card
      style={{
        marginTop: 12,
      }}
      styles={{
        body: {
          padding: "16px 16px 8px",
        },
      }}
    >
      <div
        style={{
          marginBottom: 8,
        }}
      >
        <Text
          strong
          style={{
            fontSize: 16,
          }}
        >
          최근 학습 추이
        </Text>

        <Text
          type="secondary"
          style={{
            display: "block",
            marginTop: 2,
            fontSize: 12,
          }}
        >
          최근 8주 당일평가 · 숙제 · 복습 테스트
        </Text>
      </div>

      <div
        style={{
          width: "100%",
          height: 205,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />

            <XAxis
              dataKey="weekLabel"
              tick={{
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={{
                stroke: "#d9d9d9",
              }}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              formatter={(value, name) => {
                if (value == null) {
                  return ["-", name];
                }

                if (name === "복습 테스트") {
                  return [`${value}점`, name];
                }

                return [`${value}%`, name];
              }}
            />

            <Legend
              wrapperStyle={{
                fontSize: 12,
              }}
            />

            <Line
              type="monotone"
              dataKey="dailyAverage"
              name="당일평가"
              connectNulls={false}
              stroke="#1677ff"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#1677ff",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                dataKey="dailyAverage"
                position="top"
                fontSize={10}
                formatter={(value) => (value == null ? "" : `${value}`)}
              />
            </Line>

            <Line
              type="monotone"
              dataKey="homeworkAverage"
              name="숙제"
              connectNulls={false}
              stroke="#52c41a"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#52c41a",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                dataKey="homeworkAverage"
                position="top"
                fontSize={10}
                formatter={(value) => (value == null ? "" : `${value}`)}
              />
            </Line>

            <Line
              type="monotone"
              dataKey="reviewScore"
              name="복습 테스트"
              connectNulls={false}
              stroke="#faad14"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#faad14",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                dataKey="reviewScore"
                position="bottom"
                fontSize={10}
                formatter={(value) => (value == null ? "" : `${value}`)}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
