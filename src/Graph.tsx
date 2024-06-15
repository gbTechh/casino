import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  labels: string[];
  values: number[];
}

export const BarChart = ({labels = [], values = []}: Props) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "",
        data: values,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

 const options = {
   indexAxis: "x" as const,
   elements: {
     bar: {
       borderWidth: 2,
     },
   },
   responsive: true,
   plugins: {
     legend: {
       position: "right" as const,
     },
     title: {
       display: true,
       text: "Chart.js Horizontal Bar Chart",
     },
   },
 };

  return (
    <Bar

      options={options}
      data={data}
    />
  );
};
