<script>
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';
  
  export let data = null;     // Hardcoded data for testing/demos
  export let source = null;   // SQL query reference for production  
  export let title = 'Pie Chart';
  export let visible = true;
  
  let chartDiv;
  let chart;

  // Priority: data (hardcoded) overrides source (SQL)
  $: chartData = (() => {
    console.log('PieChart props - data:', data, 'source:', source);
    
    let rawData;
    if (data !== null) {
      // Use hardcoded data for testing/demos
      if (Array.isArray(data)) {
        console.log('PieChart using hardcoded array:', data);
        rawData = data;
      } else if (typeof data === 'string') {
        try {
          rawData = JSON.parse(data);
          console.log('PieChart using parsed hardcoded data:', rawData);
        } catch (e) {
          console.error('Invalid JSON in data attribute:', e);
          rawData = [{ name: 'Invalid Data', value: 1 }];
        }
      }
    } else if (source !== null) {
      // TODO: Execute SQL query from source
      console.log('PieChart would execute SQL:', source);
      rawData = [{ name: 'SQL Placeholder', value: 100 }];
    } else {
      // Fallback
      rawData = [{ name: 'No Data', value: 1 }];
    }
    
    // Ensure data format matches ECharts pie chart requirements
    const formatted = rawData.map(item => ({
      name: item.name || item.month || item.category || 'Unknown',
      value: item.value || item.sales || item.users || item.amount || 0
    }));
    console.log('PieChart formatted data:', formatted);
    return formatted;
  })();

  $: chartOption = {
    title: { 
      text: title,
      textStyle: { color: '#d4d4d4' }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#2d2d30',
      borderColor: '#404040',
      textStyle: { color: '#d4d4d4' }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#d4d4d4' }
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: chartData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      itemStyle: {
        borderColor: '#2d2d30',
        borderWidth: 2
      }
    }]
  };

  onMount(() => {
    if (visible && chartDiv) {
      chart = echarts.init(chartDiv);
      chart.setOption(chartOption);
    }
  });

  $: if (chart && visible) {
    chart.setOption(chartOption);
  }

  onDestroy(() => {
    if (chart) {
      chart.dispose();
    }
  });
</script>

{#if visible}
  <div class="chart-container">
    <div bind:this={chartDiv} class="chart"></div>
    <div class="chart-info">
      <small>
        {#if data !== null}
          Data: {chartData.length} points (hardcoded)
        {:else if source !== null}
          Source: {source} | {chartData.length} points
        {:else}
          No data or source provided
        {/if}
      </small>
    </div>
  </div>
{/if}

<style>
  .chart-container {
    background: #2d2d30;
    border-radius: 4px;
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .chart {
    width: 100%;
    height: 300px;
  }
  
  .chart-info {
    text-align: center;
    margin-top: 0.5rem;
    color: #888;
  }
</style>
