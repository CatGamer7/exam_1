import { Layout, DatePicker, Select, Card, Button, Space } from 'antd'
import { Filters } from '../api'
import dayjs from 'dayjs'

const { Sider } = Layout
const { RangePicker } = DatePicker

interface Props { filters: Filters; onChange: (f: Filters) => void }

export default function FilterSidebar({ filters, onChange }: Props) {
  const update = (key: keyof Filters, val: any) => onChange({ ...filters, [key]: val })

  return (
    <Sider width={300} style={{ background: '#fff', padding: '16px', borderRight: '1px solid #f0f0f0' }}>
      <Card title="Фильтры дашборда" size="small" bordered={false}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>Период</div>
          <RangePicker 
            style={{ width: '100%' }} 
            value={filters.date_from && filters.date_to ? [dayjs(filters.date_from), dayjs(filters.date_to)] : null}
            onChange={(dates) => {
              onChange({
                ...filters, 
                date_from: dates?.[0]?.format('YYYY-MM-DD'), 
                date_to: dates?.[1]?.format('YYYY-MM-DD')
              })
            }} 
          />
          <div>Регион пациента</div>
          <Select mode="multiple" style={{ width: '100%' }} placeholder="Все регионы" 
            options={['Дальневосточный', 'Северо-Западный', 'Северо-Кавказский', 'Уральский', 'Центральный'].map(r => ({label: r, value: r}))}
            value={filters.regions} onChange={(v) => update('regions', v)} allowClear />
          
          <div>Категория услуги</div>
          <Select mode="multiple" style={{ width: '100%' }} placeholder="Все категории"
            options={['Детская стоматология', 'Протезирование', 'Гигиена', 'Имплантация', 'Ортодонтия', 'Терапия'].map(c => ({label: c, value: c}))}
            value={filters.categories} onChange={(v) => update('categories', v)} allowClear />

          <Button type="dashed" block onClick={() => onChange({})}>Сбросить фильтры</Button>
        </Space>
      </Card>
    </Sider>
  )
}