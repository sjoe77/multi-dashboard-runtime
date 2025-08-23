<script>
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';
  import { getDataSource } from '../lib/dataSources.js';
  
  export let data = null;     // Hardcoded data for testing/demos
  export let source = null;   // SQL query reference for production  
  export let title = 'Pie Chart';
  export let visible = true;
  
  // Clear field mapping for pie charts
  export let category = null; // Field name for category/name
  export let value = null;    // Field name for value/size
  
  let chartDiv;
  let chart;
  let chartData = [];
  let isLoading = false;
  let lastLoadedSource = null;

  // Auto-detect dashboard name from URL
  $: dashboardName = (() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const segments = path.split('/');
      return segments[2]; // /dashboards/[name]/...
    }
    return null;
  })();

  // Load data when source changes
  async function loadData() {
    if (!source || source === lastLoadedSource || isLoading) return;
    
    console.log(`🔄 PieChart loading data for source: ${source}`);
    isLoading = true;
    lastLoadedSource = source;
    
    try {
      chartData = await getDataSource(source, dashboardName);
      console.log(`✅ PieChart loaded ${chartData.length} data points:`, chartData);
    } catch (error) {
      console.error(`❌ PieChart failed to load data for ${source}:`, error);
      chartData = [];
    } finally {
      isLoading = false;
    }
  }

  // React to source changes
  $: if (source) {
    loadData();
  }

  // Priority: data (hardcoded) overrides source (SQL)
  $: finalData = (() => {
    if (data !== null) {
      // Use hardcoded data for testing/demos
      if (Array.isArray(data)) {
        console.log('PieChart using hardcoded array:', data);
        return data;
      } else if (typeof data === 'string') {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error('Invalid JSON in data attribute:', e);
          return [{ name: 'Invalid Data', value: 1 }];
        }
      }
    }
    
    // Use loaded SQL data or empty array (no fake fallback)
    return chartData;
  })();

  // Auto-detect field names if not specified
  function detectFields(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return { categoryField: null, valueField: null };
    
    const firstRow = data[0];
    const fields = Object.keys(firstRow);
    
    // Try to detect category field (names)
    let categoryField = category;
    if (!categoryField) {
      categoryField = fields.find(f => 
        f.toLowerCase().includes('name') || 
        f.toLowerCase().includes('category') || 
        f.toLowerCase().includes('label') ||
        f.toLowerCase().includes('type') ||
        f.toLowerCase().includes('status')
      ) || fields[0];
    }
    
    // Try to detect value field (numeric)
    let valueField = value;
    if (!valueField) {
      valueField = fields.find(f => 
        f.toLowerCase().includes('value') ||
        f.toLowerCase().includes('amount') ||
        f.toLowerCase().includes('count') ||
        typeof firstRow[f] === 'number'
      ) || fields[1];
    }
    
    return { categoryField, valueField };
  }

  // Auto-detect fields based on data
  $: ({ categoryField, valueField } = detectFields(finalData));
    
  // Ensure data format matches ECharts pie chart requirements
  $: formattedData = finalData.map(item => ({
    name: item[categoryField] || 'Unknown',
    value: item[valueField] || 0
  }));

  $: chartOption = {
    title: { 
      text: title,
      left: 'center',
      top: '20px',
      textStyle: { 
        color: '#374151',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' },
      borderWidth: 1,
      borderRadius: 6,
      padding: [8, 12],
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '20px',
      left: 'center',
      itemGap: 15,
      textStyle: { 
        color: '#6b7280',
        fontSize: 12
      }
    },
    series: [{
      type: 'pie',
      radius: ['20%', '65%'],
      center: ['50%', '50%'],
      data: formattedData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      itemStyle: {
        borderColor: '#ffffff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        color: '#374151',
        fontSize: 12,
        fontWeight: '500',
        formatter: '{b}: {d}%'
      },
      labelLine: {
        show: true,
        lineStyle: {
          color: '#9ca3af'
        }
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
    width: 100%;
    height: 100%;
  }
  
  .chart {
    width: 100%;
    height: 350px;
  }
  
  .chart-info {
    text-align: center;
    margin-top: 0.5rem;
    color: #888;
  }
</style>
