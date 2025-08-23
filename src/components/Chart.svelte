<script>
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';
  
  export let option = {};
  let chartDiv;
  let chart;

  onMount(() => {
    chart = echarts.init(chartDiv);
    chart.setOption(option);
  });

  $: if (chart) {
    chart.setOption(option);
  }

  onDestroy(() => {
    if (chart) {
      chart.dispose();
    }
  });
</script>

<div bind:this={chartDiv} style="width:100%;height:400px;"></div>
