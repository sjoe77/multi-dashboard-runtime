<script>
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';
  
  export let data = null;     // Hardcoded data for testing/demos
  export let source = null;   // SQL query reference for production
  export let title = 'Bar Chart';
  export let visible = true;
  
  let chartDiv;
  let chart;

  // Priority: data (hardcoded) overrides source (SQL)
  $: chartData = (() => {
    console.log('=== BarChart Debug ===');
    console.log('Received data:', data);
    console.log('Type of data:', typeof data);
    console.log('Is array?', Array.isArray(data));
    console.log('Received source:', source);
    console.log('===================');
    
    if (data !== null && data !== undefined) {
      // Use hardcoded data for testing/demos
      if (Array.isArray(data)) {
        console.log('✅ Using array data:', data);
        return data;
      } else if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ Parsed string data:', parsed);
          return parsed;
        } catch (e) {
          console.error('❌ Invalid JSON in data attribute:', e);
          return [{ month: 'Invalid Data', sales: 0 }];
        }
      } else {
        console.log('❌ Data is not array or string:', data);
        return [{ month: 'Unknown Data Type', sales: 0 }];
      }
    }
    
    // Skip source for now as instructed
    console.log('🚫 No data provided, using fallback');
    return [{ month: 'No Data', sales: 0 }];
  })();

  $: chartOption = {
    title: { 
      text: title,
      textStyle: { color: '#d4d4d4' }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2d2d30',
      borderColor: '#404040',
      textStyle: { color: '#d4d4d4' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.month || d.name || d.category),
      axisLine: { lineStyle: { color: '#404040' } },
      axisLabel: { color: '#d4d4d4' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#404040' } },
      axisLabel: { color: '#d4d4d4' },
      splitLine: { lineStyle: { color: '#404040' } }
    },
    series: [{
      type: 'bar',
      data: chartData.map(d => d.sales || d.value || d.amount),
      itemStyle: {
        color: '#569cd6'
      }
    }]
  };

  onMount(() => {
    console.log('BarChart onMount - visible:', visible, 'chartDiv:', chartDiv);
    if (visible && chartDiv) {
      chart = echarts.init(chartDiv);
      console.log('BarChart initialized chart:', chart);
      chart.setOption(chartOption);
      console.log('BarChart set option:', chartOption);
    }
  });

  $: if (chart && visible) {
    console.log('BarChart updating option:', chartOption);
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
