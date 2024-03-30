import React from 'react'
import PropTypes from 'prop-types'
import { Route, Routes } from 'react-router-dom'
import MenuMain from './MenuMain'

import Home from './home/index'

// Constants
import appConstants from '../constants/appConstants'

function RoutesList(props) {
  return (
    <Routes>
        <Route path={appConstants.routes.home} element={<Home/>}/>
        <Route path={appConstants.routes.gameChoice} element={<MenuMain/>} />
        <Route path={appConstants.routes.notFound} element={<h1 className='text-red-600 font-bold'>404 Not Found</h1>}/>
    </Routes>
  )
}

RoutesList.propTypes = {}

export default RoutesList