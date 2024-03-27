/** 
 * Declare the constant values which are used throughout the app
 */
const appConstants = {

    // React Router constants
    routes: {
        home: "/",
        gameChoice: "/select",
        gameScreen: "/play/:sessionId",
        exportReport: {
            base: "/export/:sessionId",
            children: {
                txt: "/txt",
                csv: "/csv",
                html: "/html",
            } 
        },
        notFound: "*"
    },
}

export default appConstants;