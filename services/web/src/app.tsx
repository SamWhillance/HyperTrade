import 'antd/dist/antd.css';
import 'vercel-toast/dist/vercel-toast.css';
import { Layout, Menu } from 'antd';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BiBarChart } from 'react-icons/bi';
import { RiDonutChartFill } from 'react-icons/ri';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/misc/error-boundary';
import { MenuItem, Paths } from './config/routes';
import { PubSub } from './events/pubsub';
import { DataFrameEventPayload, Events } from './events/types';
import { Chart } from './pages/chart';
import { Portfolio } from './pages/portfolio';
import { useDataFrame } from './store/dataframe';
import './styles/app.css';

const client = new QueryClient();

const { Sider } = Layout;

function App(): React.ReactElement {
  const [restore, add] = useDataFrame(state => [state.restore, state.add]);

  async function init(): Promise<void> {
    const pubsub = await PubSub.getInstance();
    await restore();

    pubsub.subscribe<DataFrameEventPayload>(Events.DataFrame, payload => {
      add([payload]);
    });
  }

  useEffect(() => {
    init();
  }, []);

  const content: React.ReactNode = (
    <Layout className='min-h-screen'>
      <Sider className='bg-gray-100' theme='light' collapsed>
        <Menu
          className='bg-gray-100 mt-2'
          theme='light'
          mode='inline'
          defaultSelectedKeys={[MenuItem.CHARTS]}>
          <Menu.Item key={MenuItem.CHARTS} icon={<BiBarChart size={25} />}>
            <Link to={Paths.HOME}>Charts</Link>
          </Menu.Item>
          <Menu.Item
            key={MenuItem.PORTFOLIO}
            icon={<RiDonutChartFill size={22} />}>
            <Link to={Paths.PORTFOLIO}>Portfolio</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Routes>
          <Route path={Paths.HOME} element={<Chart />} />
          <Route path={Paths.PORTFOLIO} element={<Portfolio />} />
        </Routes>
      </Layout>
    </Layout>
  );

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <ErrorBoundary>{content}</ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));