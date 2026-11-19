import { useState } from 'react'
import { Layout, Typography } from 'antd'
import FilterSidebar from './components/FilterSidebar'
import DashboardGrid from './components/DashboardGrid'
import { Filters } from './api'

const { Header, Content } = Layout
const { Title } = Typography

export default function App() {
  const [filters, setFilters] = useState<Filters>({})

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <Title level={3} style={{ margin: 0, color: '#1677ff' }}>Стоматология: Аналитика 2023</Title>
      </Header>
      <Layout>
        <FilterSidebar filters={filters} onChange={setFilters} />
        <Content style={{ padding: '24px', overflow: 'auto' }}>
          <DashboardGrid filters={filters} />
        </Content>
      </Layout>
    </Layout>
  )
}