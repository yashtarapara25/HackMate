// HackMate AI - Team Insights Analytics Charts

document.addEventListener('DOMContentLoaded', () => {
  const state = Utils.State.get();

  // 1. Task Velocity Chart (Area Chart)
  initTaskVelocityChart();

  // 2. Member Contributions Chart (Donut Chart)
  initContributorChart(state);

  // 3. Hourly Activity Chart (Line/Area Chart)
  initHourlyActivityChart();

  // 4. Voting Leaderboard Chart (Bar Chart)
  initVotingLeaderboardChart(state);
});

// Colors from Variables
const chartColors = {
  primary: '#8b5cf6', // Violet
  secondary: '#10b981', // Emerald
  info: '#06b6d4', // Cyan
  warning: '#f59e0b', // Amber
  danger: '#ef4444'
};

// --- CHART 1: TASK VELOCITY ---
function initTaskVelocityChart() {
  const options = {
    chart: {
      type: 'area',
      height: 280,
      toolbar: { show: false },
      background: 'transparent',
      foreColor: '#a1a1aa'
    },
    theme: { mode: 'dark' },
    stroke: { curve: 'smooth', colors: [chartColors.primary], width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: chartColors.primary, opacity: 0.4 },
          { offset: 100, color: chartColors.primary, opacity: 0.0 }
        ]
      }
    },
    series: [{
      name: 'Completed Tasks',
      data: [1, 3, 5, 8, 12, 16]
    }],
    xaxis: {
      categories: ['Day 1 Start', 'Day 1 PM', 'Day 2 AM', 'Day 2 PM', 'Day 3 AM', 'Deadline'],
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: val => Math.round(val)
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      strokeDashArray: 4
    },
    dataLabels: { showInLegend: false, enabled: false }
  };

  const chart = new ApexCharts(document.querySelector("#task-velocity-chart"), options);
  chart.render();
}

// --- CHART 2: CONTRIBUTOR DONUT ---
function initContributorChart(state) {
  const series = state.team.members.map(m => m.contribution);
  const labels = state.team.members.map(m => m.name);
  const colors = state.team.members.map(m => m.color || chartColors.primary);

  const options = {
    chart: {
      type: 'donut',
      height: 280,
      background: 'transparent',
      foreColor: '#a1a1aa'
    },
    stroke: { show: false },
    series: series,
    labels: labels,
    colors: colors,
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      markers: { radius: 12 }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true },
            value: {
              show: true,
              formatter: val => `${val}%`,
              color: '#fafafa'
            },
            total: {
              show: true,
              label: 'Total Output',
              color: '#a1a1aa',
              formatter: () => '100%'
            }
          }
        }
      }
    },
    dataLabels: { enabled: false }
  };

  const chart = new ApexCharts(document.querySelector("#contributor-chart"), options);
  chart.render();
}

// --- CHART 3: HOURLY ACTIVITY ---
function initHourlyActivityChart() {
  const options = {
    chart: {
      type: 'bar',
      height: 280,
      toolbar: { show: false },
      background: 'transparent',
      foreColor: '#a1a1aa'
    },
    theme: { mode: 'dark' },
    colors: [chartColors.info],
    series: [{
      name: 'Commits & Messages',
      data: [8, 3, 14, 32, 28, 44, 18, 12]
    }],
    xaxis: {
      categories: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      strokeDashArray: 4
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%'
      }
    },
    dataLabels: { enabled: false }
  };

  const chart = new ApexCharts(document.querySelector("#hourly-activity-chart"), options);
  chart.render();
}

// --- CHART 4: VOTING LEADERBOARD ---
function initVotingLeaderboardChart(state) {
  const seriesData = state.problemSolutionLab.ideas.map(idea => idea.score);
  const categories = state.problemSolutionLab.ideas.map(idea => idea.title.split(' - ')[0]);

  const options = {
    chart: {
      type: 'bar',
      height: 280,
      toolbar: { show: false },
      background: 'transparent',
      foreColor: '#a1a1aa'
    },
    theme: { mode: 'dark' },
    colors: [chartColors.warning],
    series: [{
      name: 'Average Rating Score',
      data: seriesData
    }],
    xaxis: {
      categories: categories,
      max: 10,
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '40%'
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      strokeDashArray: 4
    },
    dataLabels: {
      enabled: true,
      formatter: val => val.toFixed(1),
      offsetX: -10,
      style: { colors: ['#18181b'] }
    }
  };

  const chart = new ApexCharts(document.querySelector("#voting-leaderboard-chart"), options);
  chart.render();
}
