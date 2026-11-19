import { Card, Row, Col, Statistic, Table, Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Filters, fetchKPIs, fetchTrends, fetchStructure, fetchHeatmap, fetchVariant11, fetchDetails } from '../api'
import Plot from 'react-plotly.js'

const baseLayout = { 
  title: { font: { size: 14 } }, 
  margin: { t: 30, b: 40, l: 50, r: 20 },
  autosize: true
}

const PLOT_HEIGHT = 380

// --- FIX 1: PlotWrapper enforces strict height to prevent layout collapse ---
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
  const heatmap = useQuery({ queryKey: ['heatmap', filters], queryFn: () => fetchHeatmap(filters) })
  const v11 = useQuery({ queryKey: ['v11', filters], queryFn: () => fetchVariant11(filters) })
  const details = useQuery({ queryKey: ['details', filters], queryFn: () => fetchDetails(filters) })

  if (kpis.isLoading) return <Spin size="large" style={{ margin: '100px auto', display: 'block' }} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. KPIs */}
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Выручка" value={kpis.data?.total_revenue} precision={2} suffix="₽" /></Card></Col>
        <Col span={6}><Card><Statistic title="Операций" value={kpis.data?.total_operations} /></Card></Col>
        <Col span={6}><Card><Statistic title="Уникальных клиентов" value={kpis.data?.unique_clients} /></Card></Col>
        <Col span={6}><Card><Statistic title="Средний чек" value={kpis.data?.avg_check} precision={2} suffix="₽" /></Card></Col>
      </Row>

      {/* 2. Dynamics & Structure */}
      <Row gutter={[16, 16]}>
        <Col span={14}>
          <Card title="Динамика выручки по месяцам (₽)">
            <PlotWrapper isLoading={trends.isFetching && !trends.data}>
              {trends.data && (
                <Plot 
                  data={[{ 
                    x: trends.data.months, 
                    y: trends.data.revenue, 
                    type: 'scatter', 
                    mode: 'lines+markers',
                    line: { color: '#1677ff', width: 3 },
                    marker: { color: '#1677ff', size: 8 }
                  }]} 
                  layout={{ ...baseLayout, xaxis: { title: 'Месяц' }, yaxis: { title: 'Выручка, ₽' } }} 
                  config={{ responsive: true }} 
                  useResizeHandler={true} 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </PlotWrapper>
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Структура выручки по категориям">
            <PlotWrapper isLoading={structure.isFetching && !structure.data}>
              {structure.data && (
                <Plot 
                  data={[{ 
                    values: structure.data.revenue, 
                    labels: structure.data.categories, 
                    type: 'pie', 
                    hole: 0.4,
                    textinfo: 'label+percent',
                    marker: { colors: ['#1677ff', '#4096ff', '#69b1ff', '#91caff', '#bae0ff', '#e6f4ff'] }
                  }]} 
                  layout={{ 
                    ...baseLayout, 
                    margin: { t: 10, b: 10, l: 10, r: 10 },
                    legend: { orientation: 'v', x: 1.02, y: 0.5, xanchor: 'left', yanchor: 'middle', font: { size: 11 } }
                  }} 
                  config={{ responsive: true }} 
                  useResizeHandler={true} 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </PlotWrapper>
          </Card>
        </Col>
      </Row>

      {/* 3. Heatmap & Variant 11 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Тепловая карта: Выручка по дням и часам">
            <PlotWrapper isLoading={heatmap.isFetching && !heatmap.data}>
              {heatmap.data && (
                <Plot 
                  data={[{ 
                    z: heatmap.data.z_values, x: heatmap.data.hours, y: heatmap.data.days, 
                    type: 'heatmap', colorscale: 'Blues'
                  }]} 
                  layout={{ ...baseLayout, xaxis: { title: 'Час' } }} 
                  config={{ responsive: true }} 
                  useResizeHandler={true} 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </PlotWrapper>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Вариант 11: Средний чек по категориям в разрезе клиник">
            <PlotWrapper isLoading={v11.isFetching && !v11.data}>
              {v11.data && (
                <Plot 
                  data={v11.data.clinics.map((clinic, i) => ({
                    y: v11.data.categories, 
                    x: v11.data.avg_check_matrix[i], 
                    name: clinic, 
                    type: 'bar',
                    orientation: 'h' 
                  }))} 
                  layout={{ 
                    ...baseLayout, 
                    barmode: 'group', 
                    xaxis: { title: 'Средний чек, ₽' },
                    yaxis: { 
                      title: 'Категория', 
                      automargin: true,
                      ticklabelstandoff: 15 // --- FIX 2: Adds space between labels and bars ---
                    },
                    margin: { t: 30, b: 40, l: 140, r: 20 } 
                  }} 
                  config={{ responsive: true }} 
                  useResizeHandler={true} 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </PlotWrapper>
          </Card>
        </Col>
      </Row>

      {/* 4. Details Table */}
      <Card title="Детализация операций">
        <Table 
          dataSource={details.data?.rows || []} 
          rowKey={(record: any, index: number) => index}
          columns={[
            { title: 'Дата', dataIndex: 'appointment_date', render: (t: string) => t ? String(t).replace('T', ' ').substring(0, 19) : '' },
            { title: 'Клиника', dataIndex: 'clinic_name' },
            { title: 'Категория', dataIndex: 'category' },
            { title: 'Услуга', dataIndex: 'service_name' },
            { title: 'Кол-во', dataIndex: 'quantity' },
            { title: 'Выручка', dataIndex: 'revenue', render: (v: number) => v ? `${v.toFixed(2)} ₽` : '0.00 ₽' },
            { title: 'Регион', dataIndex: 'patient_region' },
          ]} 
          pagination={{ 
            defaultPageSize: 10,
            showSizeChanger: true, 
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Всего ${total} записей`
          }} 
          size="small" 
        />
      </Card>
    </div>
  )
}