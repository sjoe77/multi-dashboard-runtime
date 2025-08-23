<script>
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';
  
  export let data = null;     // Hardcoded data for testing/demos  
  export let source = null;   // SQL query reference for production
  export let title = 'Line Chart';
  export let visible = true;
  
  // Clear field mapping
  export let x = null;        // Field name for x-axis (category/time)
  export let y = null;        // Field name for y-axis (value)
  
  let chartDiv;
  let chart;

  // Auto-detect field names if not specified
  function detectFields(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return { xField: null, yField: null };
    
    const firstRow = data[0];
    const fields = Object.keys(firstRow);
    
    // Try to detect x-axis field (time/category)
    let xField = x;
    if (!xField) {
      xField = fields.find(f => 
        f.toLowerCase().includes('time') || 
        f.toLowerCase().includes('date') || 
        f.toLowerCase().includes('month') ||
        f.toLowerCase().includes('period') ||
        f.toLowerCase().includes('hour')
      ) || fields[0];
    }
    
    // Try to detect y-axis field (numeric)
    let yField = y;
    if (!yField) {
      yField = fields.find(f => 
        typeof firstRow[f] === 'number' && f !== xField
      ) || fields[1];
    }
    
    return { xField, yField };
  }

  // Priority: data (hardcoded) overrides source (SQL)
  $: chartData = (() => {
    console.log('LineChart props - data:', data, 'source:', source);
    
    if (data !== null) {
      // Use hardcoded data for testing/demos
      if (Array.isArray(data)) {
        console.log('LineChart using hardcoded array:', data);
        return data;
      } else if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          console.log('LineChart using parsed hardcoded data:', parsed);
          return parsed;
        } catch (e) {
          console.error('Invalid JSON in data attribute:', e);
          return [{ month: 'Invalid Data', users: 0 }];
        }
      }
    }
    
    if (source !== null) {
      // TODO: Execute SQL query from source
      console.log('LineChart would execute SQL:', source);
      return [{ month: 'SQL Placeholder', users: 1000 }];
    }
    
    // Fallback
    return [{ time: 'No Data', value: 0 }];
  })();

  // Auto-detect fields based on data
  $: ({ xField, yField } = detectFields(chartData));

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
      data: chartData.map(d => d[xField]),
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
      type: 'line',
      data: chartData.map(d => d[yField]),
      lineStyle: {
        color: '#4ec9b0'
      },
      itemStyle: {
        color: '#4ec9b0'
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
