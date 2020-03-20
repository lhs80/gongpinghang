import {useLayoutEffect} from 'react'
import {useRouter} from 'next/router'
import PropTypes from 'prop-types'
import cookie from 'react-cookies'

const ClientRedirect = ({from, to, children}) => {
	// Get the router by hook
	const {route, replace, push} = useRouter()
	// We use useLayoutEffect here in order to react
	// to route changes before the browser has a chance
	// to paint anything.
	useLayoutEffect(() => {
		// if (route === from.router.route) {
		if (route.indexOf('/account') >= 0) {
			if (!cookie.load('ZjsWeb') || !cookie.load('ZjsWeb').userCode)
			// Here we are changing the route to the new route
			// without adding a history entry. Use push if you
			// want to add an history entry.
				replace(to)
		}
	}, [route, from, to]);

	// Return children incase you want to wrap this component
	return children || null
};

ClientRedirect.propTypes = {
	from: PropTypes.string.isRequired,
	to: PropTypes.string.isRequired
};

export default ClientRedirect
