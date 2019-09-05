import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { Layout } from 'antd';
import 'antd/dist/antd.css';

import { Navbar } from './components/Nav';
import { Routes } from './components/Routes';

import { initLeaderboard } from './actions/users';
import { checkCachedUser } from './actions/auth';

const { Header, Content, Footer } = Layout;

const BaseApp = (props) => {
  useEffect(() => {
    props.checkCachedUser();
    props.initLeaderboard();
  }, []);

  return (
    <Router>
      <Layout style={{ height: '100%' }}>
        <Navbar />

        <Content style={{ padding: '0 50px', minHeight: 750 }}>
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
  checkCachedUser
};

export default connect(
  null,
  mapDispatchToProps
)(BaseApp);
