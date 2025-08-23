<Toggle name="showMetrics" label="Show Metrics" value="true" />

<LineChart 
  title="System CPU Performance" 
  x="time"
  y="cpu"
  data={[
    {time:"00:00", cpu:45},
    {time:"04:00", cpu:30},
    {time:"08:00", cpu:75},
    {time:"12:00", cpu:85},
    {time:"16:00", cpu:70},
    {time:"20:00", cpu:55}
  ]}
/>

<BarChart
  title="Error Rates by Service"
  x="service"
  y="errors"
  data={[
    {service:"API Gateway", errors:12},
    {service:"Auth Service", errors:3},
    {service:"Database", errors:8},
    {service:"Cache", errors:2},
    {service:"CDN", errors:5}
  ]}
/>

<Filter 
  title="Time Range" 
  type="dropdown" 
  options={[
    {label: "Last 24 Hours", value: "24h"},
    {label: "Last 7 Days", value: "7d"}, 
    {label: "Last 30 Days", value: "30d"}
  ]}
/>
