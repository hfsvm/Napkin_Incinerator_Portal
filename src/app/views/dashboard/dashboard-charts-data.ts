import { Injectable } from '@angular/core';
import { getStyle } from '@coreui/utils/src';

export interface IChartProps {
  data?: any;
  labels?: any;
  options?: any;
  colors?: any;
  type?: any;
  legend?: any;

  [propName: string]: any;
}

@Injectable({
  providedIn: 'any'
})
export class DashboardChartsData {

  constructor() { }

  public salesChart: IChartProps = {
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor: `rgba(${getStyle('--cui-primary-rgb')}, .1)`,
          borderColor: getStyle('--cui-primary'),
          borderWidth: 3,
          data: [78, 81, 80, 45, 34, 22, 40],
          fill: true
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          display: false
        }
      },
      maintainAspectRatio: false,
      scales: {
        x: {
          display: false
        },
        y: {
          beginAtZero: true,
          display: false
        }
      },
      elements: {
        line: {
          borderWidth: 2,
          tension: 0.4
        },
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4
        }
      }
    }
  };

  public trafficChart: IChartProps = {
    data: {
      labels: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ],
      datasets: [
        {
          label: 'Users',
          backgroundColor: getStyle('--cui-primary'),
          borderRadius: 6,
          borderSkipped: false,
          data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
          barPercentage: 0.6,
          categoryPercentage: 0.5
        },
        {
          label: 'New users',
          backgroundColor: getStyle('--cui-gray-100'),
          borderRadius: 6,
          borderSkipped: false,
          data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
          barPercentage: 0.6,
          categoryPercentage: 0.5
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
            drawTicks: false
          },
          ticks: {
            color: getStyle('--cui-text-disabled'),
            font: {
              size: 14
            },
            padding: 16
          }
        },
        y: {
          grid: {
            drawBorder: false,
            borderDash: [2, 4]
          },
          gridLines: {
            borderDash: [8, 4],
            color: '#348632'
          },
          ticks: {
            beginAtZero: true,
            color: getStyle('--cui-text-disabled'),
            font: {
              size: 14
            },
            maxTicksLimit: 5,
            padding: 16,
            stepSize: Math.ceil(100 / 4)
          }
        }
      }
    }
  };

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}
