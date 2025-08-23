<script>
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';
  import { getDataSource } from '../lib/dataSources.js';
  
  export let data = null;     // Hardcoded data for testing/demos
  export let source = null;   // SQL query reference for production
  export let title = 'Bar Chart';
  export let visible = true;
  
  // Evidence.dev-style declarative mapping
  export let x = null;        // Field name for x-axis (category)
  export let y = null;        // Field name for y-axis (value)
  
  let chartDiv;
  let chart;
  let chartData = [];
  let loading = false;
  let lastLoadedSource = null; // Track what we last loaded to prevent duplicates

  // Auto-detect field names if not specified
  function detectFields(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return { xField: null, yField: null };
    
    const firstRow = data[0];
    const fields = Object.keys(firstRow);
    
    // Try to detect x-axis field (categorical)
    let xField = x;
    if (!xField) {
      xField = fields.find(f => 
        f.toLowerCase().includes('name') || 
        f.toLowerCase().includes('category') || 
        f.toLowerCase().includes('month') ||
        f.toLowerCase().includes('service') ||
        f.toLowerCase().includes('campaign') ||
        f.toLowerCase().includes('status')
      ) || fields[0];
    }
    
    // Try to detect y-axis field (numeric)
    let yField = y;
    if (!yField) {
      yField = fields.find(f => 
        (typeof firstRow[f] === 'number' && f !== xField) ||
        f.toLowerCase().includes('count') ||
        f.toLowerCase().includes('value') ||
        f.toLowerCase().includes('sales')
      ) || fields[1];
    }
    
    return { xField, yField };
  }

  // Load data from source or use hardcoded data
  async function loadData() {
    if (data !== null && data !== undefined) {
      // Use hardcoded data
      if (Array.isArray(data)) {
        chartData = data;
        return;
      } else if (typeof data === 'string') {
        try {
          chartData = JSON.parse(data);
          return;
        } catch (e) {
          chartData = [];
          return;
        }
      }
    }
    
    if (source) {
      // Prevent duplicate loads
      if (lastLoadedSource === source || loading) {
        return;
      }
      
      lastLoadedSource = source;
      loading = true;
      
      try {
        const currentPath = window.location.hash || window.location.pathname;
        const dashboardMatch = currentPath.match(/dashboards\/([^\/]+)/);
        const dashboardName = dashboardMatch ? dashboardMatch[1] : 'claims';
        
        chartData = await getDataSource(source, dashboardName);
      } catch (error) {
        console.error('❌ Error loading data from source:', error);
        chartData = [];
      } finally {
        loading = false;
      }
      return;
    }
    
    // NO FALLBACK - either provide data or source
    chartData = [];
  }

  // Load data when source or data changes
  $: if (source || data !== null) {
    loadData();
  }

  // Auto-detect fields based on data
  $: ({ xField, yField } = detectFields(chartData));

  $: chartOption = chartData.length > 0 ? {
    title: { 
      text: title,
      textStyle: { 
        color: '#374151',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' },
      borderWidth: 1,
      borderRadius: 6,
      padding: [8, 12]
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
      axisLine: { lineStyle: { color: '#d1d5db' } },
      axisLabel: { 
        color: '#6b7280',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#d1d5db' } },
      axisLabel: { 
        color: '#6b7280',
        fontSize: 12
      },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [{
      type: 'bar',
      data: chartData.map(d => d[yField]),
      itemStyle: {
        color: '#3b82f6',
        borderRadius: [4, 4, 0, 0]
      }
    }]
  } : null;

  onMount(async () => {
    console.log('BarChart onMount - visible:', visible, 'chartDiv:', chartDiv);
    
    // Load data first
    await loadData();
    
    // Then initialize chart
    if (visible && chartDiv && !loading) {
      chart = echarts.init(chartDiv);
      console.log('BarChart initialized chart:', chart);
      chart.setOption(chartOption);
      console.log('BarChart set option:', chartOption);
    }
  });

  // Update chart when data changes or chart is loaded
  $: if (chart && visible && !loading && chartData.length > 0) {
    console.log('BarChart updating option:', chartOption);
    chart.setOption(chartOption);
  }

  // Initialize chart when loading completes
  $: if (visible && chartDiv && !loading && !chart && chartData.length > 0) {
    chart = echarts.init(chartDiv);
    console.log('BarChart initialized chart after loading:', chart);
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
    {#if loading}
      <div class="loading">Loading data from {source}...</div>
    {:else if chartData.length === 0}
      <div class="error">
        <h3>No Data Available</h3>
        <p>
          {#if source}
            Failed to load data from source: <code>{source}</code>
          {:else if data === null}
            No data or source provided to chart
          {:else}
            Data is empty or invalid
          {/if}
        </p>
      </div>
    {:else}
      <div bind:this={chartDiv} class="chart"></div>
    {/if}
    <div class="chart-info">
      <small>
        {#if loading}
          Loading from source: {source}
        {:else if chartData.length === 0}
          ❌ No data available
        {:else if data !== null}
          ✅ Data: {chartData.length} points (hardcoded)
        {:else if source !== null}
          ✅ Source: {source} | {chartData.length} points
        {:else}
          ❌ No data or source provided
        {/if}
      </small>
    </div>
  </div>
{/if}

<style>
  .chart-container {
    width: 100%;
    height: 100%;
  }
  
  .chart {
    width: 100%;
    height: 300px;
  }
  
  .loading {
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    font-style: italic;
  }
  
  .error {
    width: 100%;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #ff6b6b;
    text-align: center;
  }
  
  .error h3 {
    margin: 0 0 1rem 0;
    color: #ff6b6b;
  }
  
  .error code {
    background: #1e1e1e;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
  
  .chart-info {
    text-align: center;
    margin-top: 0.5rem;
    color: #888;
  }
</style>
