import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { Layout, Alert, message } from 'antd';
import 'antd/dist/antd.css';

import { Navbar } from './components/Nav';
import { Routes } from './components/Routes';

import { initLeaderboard } from './actions/users';
import { initOverview } from './actions/tracking';
import { checkCachedUser } from './actions/auth';

const { Header, Content, Footer } = Layout;

const BaseApp = (props) => {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    props.initLeaderboard();
    props.initOverview();
    props.checkCachedUser();

    const offset = (-1 * new Date().getTimezoneOffset()) / 60;
    console.log(offset);

    const utcHrs = new Date().getUTCHours();
    const utcDay = new Date().getUTCDay();
    if (utcDay === 0 || utcDay === 6 || utcHrs >= 20 || utcHrs <= 13) {
      setClosed(true);
      message.warning('Stock market is currently closed.');
    }
  }, []);

  return (
    <Router>
      <Layout style={{ height: '100%' }}>
        <Navbar />

        <Content style={{ padding: '0 50px', minHeight: 750 }}>
          {closed ? (
            <Alert
              message="Stock market is currently closed (open weekdays 9:30AM - 4:00PM EST). Real-time notifications are disabled."
              type="warning"
              closable
              style={{ margin: '15px' }}
            />
          ) : (
            ''
          )}
          <Routes />
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          Created by Thilan Tran 2019
        </Footer>
      </Layout>
    </Router>
  );
};

const mapDispatchToProps = {
  initLeaderboard,
  initOverview,
  checkCachedUser
};

export default connect(
  null,
  mapDispatchToProps
)(BaseApp);
