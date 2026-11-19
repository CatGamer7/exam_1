import { useState } from 'react'
import { Layout, Typography } from 'antd'
import FilterSidebar from './components/FilterSidebar'
import DashboardGrid from './components/DashboardGrid'
import { Filters } from './api'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

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

      {/* --- NEW: Authorship Footer --- */}
      <Footer style={{ 
        textAlign: 'center', 
        color: '#888', 
        fontSize: '12px', 
        padding: '12px 24px',
        background: '#fff',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Text>
          Дашборд разработан в рамках дисциплины "Визуализация данных", часть 1 экзамена, Вариант 11. 
          Автор: <Text strong>Зайда Артур</Text>, гр. <Text strong>8ПМ51</Text>
        </Text>
      </Footer>
    </Layout>
  )
}