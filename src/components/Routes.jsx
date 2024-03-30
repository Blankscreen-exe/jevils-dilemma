import React from 'react'
import PropTypes from 'prop-types'
import { Route, Routes } from 'react-router-dom'
import MenuMain from './MenuMain'

// Constants
import appConstants from '../constants/appConstants'

function RoutesList(props) {
  return (
    <Routes>
        {/* TODO: replace this with a real Home component */}
        <Route path={appConstants.routes.home} element={<h1>Home</h1>}/>
        <Route path="/select" element={<MenuMain />} />
        <Route path={appConstants.routes.notFound} element={<h1 className='text-red-600 font-bold'>404 Not Found</h1>}/>
    </Routes>
  )
}

RoutesList.propTypes = {}

export default RoutesList