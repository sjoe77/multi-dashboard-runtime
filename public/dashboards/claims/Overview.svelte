<Toggle name="showBarChart" label="Show Bar Chart" value="true" />
<Toggle name="showPieChart" label="Show Pie Chart" value="true" />

<Grid columns="2">
  {#if inputs.showBarChart}
  <BarChart 
    title="Claims by Status"
    source="claims_by_status"
    x="status"
    y="count"
  />
  {/if}

  {#if inputs.showPieChart}
  <PieChart 
    title="Claims Distribution"
    source="claims_by_status"
    x="status"
    y="count"
  />
  {/if}
</Grid>
