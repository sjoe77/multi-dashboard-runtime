<script>
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';
  
  export let option = null;
  const baseOption = {
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value' },
    series: []
  };
  let chartDiv;
  let chart;
  let ro;

  function resize() {
    if (chart) {
      chart.resize({ animation: { duration: 0 } });
    }
  }

  onMount(() => {
  chart = echarts.init(chartDiv);
  chart.setOption(option && Object.keys(option).length ? option : baseOption);

    // Ensure proper sizing on container changes
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => {
        // Resize on next microtask to avoid measuring during layout shift
        Promise.resolve().then(resize);
      });
      ro.observe(chartDiv);
    }
    window.addEventListener('resize', resize);

    // Defer extra resizes for drawer transition
    setTimeout(resize, 0);
    setTimeout(resize, 180);
  });

  $: if (chart) {
    chart.setOption(option && Object.keys(option).length ? option : baseOption);
  }

  onDestroy(() => {
    window.removeEventListener('resize', resize);
    if (ro) ro.disconnect();
    if (chart) {
      chart.dispose();
    }
  });
</script>

<div bind:this={chartDiv} style="width:100%;height:400px;flex: 1 1 100%;"></div>
