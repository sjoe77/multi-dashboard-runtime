<Toggle name="showCharts" label="Show Charts" value="true" />

<BarChart 
  title="Simple Test" 
  data={[{month:"Jan", sales:100}]}
/>

<Filter 
  title="Region Filter" 
  type="dropdown" 
  options={[
    {label: "North America", value: "NA"},
    {label: "Europe", value: "EU"}, 
    {label: "Asia Pacific", value: "APAC"}
  ]}
  visible="{inputs.showCharts}"
/>
