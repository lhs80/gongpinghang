import Router from "next/router";

// redirect helper function to be used in getInitialProps
export default Router.beforePopState(({ url, as, options }) => {
  // I only want to allow these two routes!
  if (as !== "/" || as !== "/other") {
    // Have SSR render bad routes as a 404.
    window.location.href = as
    return false
  }
  return true
});
