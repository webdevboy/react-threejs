import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { path } from 'ramda';
import { useHistory } from "react-router-dom";

import Mesh from '../components/Mesh';

function Main(props) {
  const { meshItems } = props;
  const history = useHistory();
  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if(!user) {
      history.replace('/login');
    }
  }, []);
  return (
    <Mesh {...{ meshItems }} />
  );
};

const mapStateToProps = state => ({
  meshItems: path(['meshItems'], state),
});

export default connect(mapStateToProps)(Main);
