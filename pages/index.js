
import React from 'react'
import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
import { startClock, addCount, serverRenderClock } from '../store/actions/clock'


import Layout from '../components/layout'

import "./index.less"

class Index extends React.Component {
  static getInitialProps ({ store, isServer }) {
    store.dispatch(serverRenderClock(isServer))
    store.dispatch(addCount())

    return { isServer }
  }

  componentDidMount () {
    this.timer = this.props.startClock()
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  render () {
    return (
      <Layout title="index page title">
        <div>Welcome to next.js! {this.props.clock.lastUpdate}</div>
      </Layout>
    )
  }
}

// 另外一种map形式，稍微麻烦
// const mapDispatchToProps = (dispatch) => {
//   return {
//     addCount: bindActionCreators(addCount, dispatch),
//     startClock: bindActionCreators(startClock, dispatch)
//   }
// }

const mapDispatchToProps = {
    addCount,
    startClock,
}

export default connect(state => state, mapDispatchToProps)(Index)