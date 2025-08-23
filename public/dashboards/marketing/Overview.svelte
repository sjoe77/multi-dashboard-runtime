<Toggle name="showCharts" label="Show Charts" value="true" />

<BarChart 
  title="Campaign Performance" 
  x="campaign"
  y="conversions"
  data={[
    {campaign:"Email", conversions:150},
    {campaign:"Social", conversions:95},
    {campaign:"Search", conversions:220},
    {campaign:"Display", conversions:75},
    {campaign:"Video", conversions:180}
  ]}
/>

<PieChart
  title="Marketing Channel Distribution"
  category="channel"
  value="percentage"
  data={[
    {channel:"Email", percentage:25},
    {channel:"Social Media", percentage:20},
    {channel:"Search Ads", percentage:30},
    {channel:"Display", percentage:10},
    {channel:"Video", percentage:15}
  ]}
/>

<Filter 
  title="Campaign Filter" 
  type="dropdown" 
  options={[
    {label: "All Campaigns", value: "all"},
    {label: "Email Only", value: "email"}, 
    {label: "Paid Ads", value: "paid"}
  ]}
/>
