import { Card, Row, Col, Statistic, Table, Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Filters, fetchKPIs, fetchTrends, fetchStructure, fetchHeatmap, fetchVariant11, fetchDetails } from '../api'
import Plot from 'react-plotly.js'

const layout = { title: { font: { size: 14 } }, margin: { t: 30, b: 40, l: 50, r: 20 } }

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
        <Col span={16}>
          <Card title="Динамика выручки по месяцам (₽)">
            {trends.data && (
              <Plot data={[{ 
                x: trends.data.months, y: trends.data.revenue, type: 'scatter', mode: 'lines+markers',
                marker: { color: 'rgba(255, 99, 132, 0.2)' }, // Base color
                // Note: Plotly min/max markers logic handled via annotations in real app, simplified here
              }]} layout={{ ...layout, xaxis: { title: 'Месяц' }, yaxis: { title: 'Выручка' } }} config={{ responsive: true }} style={{ width: '100%' }} />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Структура выручки по категориям">
            {structure.data && (
              <Plot data={[{ 
                values: structure.data.revenue, labels: structure.data.categories, type: 'pie', hole: 0.4,
                textinfo: 'label+percent'
              }]} layout={layout} config={{ responsive: true }} style={{ width: '100%' }} />
            )}
          </Card>
        </Col>
      </Row>

      {/* 3. Heatmap & Variant 11 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Тепловая карта: Выручка по дням и часам">
            {heatmap.data && (
              <Plot data={[{ 
                z: heatmap.data.z_values, x: heatmap.data.hours, y: heatmap.data.days, 
                type: 'heatmap', colorscale: 'Blues'
              }]} layout={{ ...layout, xaxis: { title: 'Час' } }} config={{ responsive: true }} style={{ width: '100%' }} />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Вариант 11: Средний чек по категориям в разрезе клиник">
            {v11.data && (
              <Plot data={v11.data.clinics.map((clinic, i) => ({
                x: v11.data.categories, y: v11.data.avg_check_matrix[i], name: clinic, type: 'bar'
              }))} layout={{ ...layout, barmode: 'group', yaxis: { title: 'Средний чек, ₽' } }} config={{ responsive: true }} style={{ width: '100%' }} />
            )}
          </Card>
        </Col>
      </Row>

      {/* 4. Details Table */}
      <Card title="Детализация операций">
        <Table 
          dataSource={details.data?.rows} 
          rowKey={(r) => r.appointment_date + r.service_name}
          columns={[
            { title: 'Дата', dataIndex: 'appointment_date' },
            { title: 'Клиника', dataIndex: 'clinic_name' },
            { title: 'Категория', dataIndex: 'category' },
            { title: 'Услуга', dataIndex: 'service_name' },
            { title: 'Кол-во', dataIndex: 'quantity' },
            { title: 'Выручка', dataIndex: 'revenue', render: (v: number) => `${v.toFixed(2)} ₽` }
          ]} 
          pagination={{ pageSize: 10 }} 
          size="small" 
        />
      </Card>
    </div>
  )
}