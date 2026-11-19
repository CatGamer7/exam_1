import { Card, Row, Col, Statistic, Table, Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { 
  Filters, fetchKPIs, fetchTrends, fetchStructure, fetchHeatmap, 
  fetchVariant11, fetchDetails, fetchCategoryVolume, fetchDiscountDistribution 
} from '../api'
import Plot from 'react-plotly.js'

// Larger b/l margins so axis titles actually have room to render
const baseLayout = { 
  title: { font: { size: 14 } }, 
  margin: { t: 30, b: 70, l: 90, r: 20 },
  autosize: true
}

const PLOT_HEIGHT = 380

// Helper to build a title object with standoff in one place
const axisTitle = (text: string, standoff = 10) => ({ text, standoff })

// --- CENTRALIZED TITLE DICTIONARIES ---
const CHART_TITLES = {
  trends: "Пики выручки в январе и октябре",
  structure: "Наибольшая выручка по детской стоматологии",
  volume: "Чаще всего выполняется терапия",
  heatmap: "Выручка примерно равна в каждый из дней недели",
  discounts: "Чаще всего назначается скидка в 10%",
  v11: "Детская стоматология ведёт по среднему чеку в детской клинике",
} as const

const GENERIC_TITLES = {
  trends: "Динамика выручки по месяцам",
  structure: "Структура выручки по категориям",
  volume: "Объём продаж по категориям",
  heatmap: "Тепловая карта: Выручка по дням и часам",
  discounts: "Распределение скидок",
  v11: "Вариант 11: Средний чек по категориям в разрезе клиник",
} as const

const getChartTitle = (key: keyof typeof CHART_TITLES, filters: Filters): string => {
  const hasFilters = 
    (filters.date_from || filters.date_to) ||
    (filters.regions && filters.regions.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.clinics && filters.clinics.length > 0)
  return hasFilters ? GENERIC_TITLES[key] : CHART_TITLES[key]
}

const PlotWrapper = ({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) => (
  <div style={{ height: PLOT_HEIGHT, width: '100%', position: 'relative' }}>
    {isLoading && !children && (
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <Spin size="large" />
      </div>
    )}
    {children}
  </div>
)

export default function DashboardGrid({ filters }: { filters: Filters }) {
  const kpis = useQuery({ queryKey: ['kpis', filters], queryFn: () => fetchKPIs(filters) })
  const trends = useQuery({ queryKey: ['trends', filters], queryFn: () => fetchTrends(filters) })
  const structure = useQuery({ queryKey: ['structure', filters], queryFn: () => fetchStructure(filters) })
  const volume = useQuery({ queryKey: ['volume', filters], queryFn: () => fetchCategoryVolume(filters) })
  const heatmap = useQuery({ queryKey: ['heatmap', filters], queryFn: () => fetchHeatmap(filters) })
  const discounts = useQuery({ queryKey: ['discounts', filters], queryFn: () => fetchDiscountDistribution(filters) })
  const v11 = useQuery({ queryKey: ['v11', filters], queryFn: () => fetchVariant11(filters) })
  const details = useQuery({ queryKey: ['details', filters], queryFn: () => fetchDetails(filters) })

  if (kpis.isLoading) return <Spin size="large" style={{ margin: '100px auto', display: 'block' }} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. KPIs */}
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Выручка" value={kpis.data?.total_revenue} precision={2} suffix=" ₽" /></Card></Col>
        <Col span={6}><Card><Statistic title="Операций" value={kpis.data?.total_operations} suffix=" шт." /></Card></Col>
        <Col span={6}><Card><Statistic title="Уникальных клиентов" value={kpis.data?.unique_clients} suffix=" чел." /></Card></Col>
        <Col span={6}><Card><Statistic title="Средний чек" value={kpis.data?.avg_check} precision={2} suffix=" ₽" /></Card></Col>
      </Row>

      {/* 2. Dynamics & Structure */}
      <Row gutter={[16, 16]}>
        <Col span={14}>
          <Card title={getChartTitle('trends', filters)}>
            <PlotWrapper isLoading={trends.isFetching && !trends.data}>
              {trends.data && (
                <Plot 
                  data={[{ 
                    x: trends.data.months, y: trends.data.revenue, type: 'scatter', mode: 'lines+markers',
                    line: { color: '#1677ff', width: 3 }, marker: { color: '#1677ff', size: 8 }
                  }]} 
                  layout={{ 
                    ...baseLayout, 
                    xaxis: { title: axisTitle('Месяц') }, 
                    yaxis: { title: axisTitle('Выручка, руб.') },
                    showlegend: false,
                    annotations: [
                      { x: trends.data.months[trends.data.min_month_idx], y: trends.data.revenue[trends.data.min_month_idx], text: 'Мин.', showarrow: true, arrowhead: 2, ax: 0, ay: -40, font: { color: 'red' } },
                      { x: trends.data.months[trends.data.max_month_idx], y: trends.data.revenue[trends.data.max_month_idx], text: 'Макс.', showarrow: true, arrowhead: 2, ax: 0, ay: -40, font: { color: 'green' } }
                    ]
                  }} 
                  config={{ responsive: true }} useResizeHandler={true} 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </PlotWrapper>
          </Card>
        </Col>
        <Col span={10}>
          <Card title={getChartTitle('structure', filters)}>
            <PlotWrapper isLoading={structure.isFetching && !structure.data}>
              {structure.data && (
                <Plot 
                  data={[{ 
                    values: structure.data.revenue, labels: structure.data.categories, 
                    type: 'pie', hole: 0.4,
                    textinfo: 'none',
                    hovertemplate: '%{label}<br>%{value:,.0f} руб.<br>%{percent}<extra></extra>',
                    marker: { colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'] }
                  }]} 
                  layout={{ 
                    ...baseLayout, 
                    margin: { 
                      t: 10, 
                      b: 10, 
                      l: 10, 
                      r: structure.data.categories.length > 1 ? 160 : 10 
                    },
                    showlegend: structure.data.categories.length > 1,
                    legend: { orientation: 'v', x: 1.0, xanchor: 'left', y: 0.5, yanchor: 'middle', font: { size: 11 } }
                  }} 
                  config={{ responsive: true }} useResizeHandler={true} 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </PlotWrapper>
          </Card>
        </Col>
      </Row>

      {/* 3. Volume & Discounts */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title={getChartTitle('volume', filters)}>
            <PlotWrapper isLoading={volume.isFetching && !volume.data}>
              {volume.data && (
                <Plot 
                  data={[{ 
                    x: volume.data.volume, y: volume.data.categories, 
                    type: 'bar', orientation: 'h', marker: { color: '#1677ff' }
                  }]} 
                  layout={{ 
                    ...baseLayout, 
                    xaxis: { title: axisTitle('Количество операций, шт.') },
                    // ticklabelstandoff pushes category labels away from the bar start line
                    yaxis: { title: axisTitle('Категория'), automargin: true, ticklabelstandoff: 12 },
                    showlegend: false
                  }} 
                  config={{ responsive: true }} useResizeHandler={true} 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </PlotWrapper>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={getChartTitle('discounts', filters)}>
            <PlotWrapper isLoading={discounts.isFetching && !discounts.data}>
              {discounts.data && (
                <Plot 
                  data={[{ 
                    x: discounts.data.discounts, y: discounts.data.counts, 
                    type: 'bar', marker: { color: '#1677ff' }
                  }]} 
                  layout={{ 
                    ...baseLayout, 
                    xaxis: { title: axisTitle('Размер скидки, %'), dtick: 5 },
                    yaxis: { title: axisTitle('Количество операций, шт.') },
                    showlegend: false
                  }} 
                  config={{ responsive: true }} useResizeHandler={true} 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </PlotWrapper>
          </Card>
        </Col>
      </Row>

      {/* 4. Heatmap & Variant 11 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title={getChartTitle('heatmap', filters)}>
            <PlotWrapper isLoading={heatmap.isFetching && !heatmap.data}>
              {heatmap.data && (
                <Plot 
                  data={[{ 
                    z: heatmap.data.z_values, x: heatmap.data.hours, y: heatmap.data.days, 
                    type: 'heatmap', colorscale: 'Blues'
                  }]} 
                  layout={{ 
                    ...baseLayout, 
                    xaxis: { title: axisTitle('Час') },
                    yaxis: { title: axisTitle('День недели') },
                    showlegend: false
                  }} 
                  config={{ responsive: true }} useResizeHandler={true} 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </PlotWrapper>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={getChartTitle('v11', filters)}>
            <PlotWrapper isLoading={v11.isFetching && !v11.data}>
              {v11.data && (
                <Plot 
                  data={v11.data.clinics.map((clinic, i) => ({
                    y: v11.data.categories, x: v11.data.avg_check_matrix[i], 
                    name: clinic, type: 'bar', orientation: 'h' 
                  }))} 
                  layout={{ 
                    ...baseLayout, 
                    barmode: 'group', 
                    xaxis: { title: axisTitle('Средний чек, руб.') },
                    yaxis: { title: axisTitle('Категория'), automargin: true, ticklabelstandoff: 15 },
                    showlegend: v11.data.clinics.length > 1
                  }} 
                  config={{ responsive: true }} useResizeHandler={true} 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </PlotWrapper>
          </Card>
        </Col>
      </Row>

      {/* 5. Details Table */}
      <Card title="Детализация операций">
        <Table 
          dataSource={details.data?.rows || []} 
          rowKey={(record: any, index: number) => index}
          columns={[
            { title: 'Дата', dataIndex: 'appointment_date', render: (t: string) => t ? String(t).replace('T', ' ').substring(0, 19) : '' },
            { title: 'Клиника', dataIndex: 'clinic_name' },
            { title: 'Категория', dataIndex: 'category' },
            { title: 'Услуга', dataIndex: 'service_name' },
            { title: 'Кол-во, шт.', dataIndex: 'quantity' },
            { title: 'Выручка, руб.', dataIndex: 'revenue', render: (v: number) => v ? `${v.toFixed(2)} ₽` : '0.00 ₽' },
            { title: 'Регион', dataIndex: 'patient_region' },
          ]} 
          pagination={{ 
            defaultPageSize: 10, showSizeChanger: true, 
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Всего ${total} записей`
          }} 
          size="small" 
        />
      </Card>
    </div>
  )
}