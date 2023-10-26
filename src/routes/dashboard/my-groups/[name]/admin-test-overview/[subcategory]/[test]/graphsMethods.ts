import type { ChartConfiguration } from "chart.js";

export const createVerticalBarChartConfig = (chartData1: number, chartData2: number, isDarkMode = false) => {
  return {
    type: 'bar',
    data: {
      labels: [''],
      datasets: [
        {
          label: 'Maximum',
          data: [chartData1], // The total range (maximum value)
          backgroundColor:
            getComputedStyle(document.documentElement).getPropertyValue(
              isDarkMode
                ? '--dark-text-white-20'
                : '--light-text-black-20'
            ) || '#6722e6' // Maximum segment color with transparency
        },
        {
          label: 'Average',
          data: [chartData2], // The actual value
          backgroundColor:
            getComputedStyle(document.documentElement).getPropertyValue(
              isDarkMode
                ? '--dark-primary'
                : '--light-primary'
            ) || '#6722e6' // Maximum segment color with transparency // Actual Value segment color with transparency
        }
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true
        },
        y: {
          stacked: true
        }
      },
      plugins: {
        legend: {
          display: true,
          align: 'center',
          position: 'bottom',
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onClick: () => { }
        }
      }
    }
  } satisfies ChartConfiguration;
}