import Home from "./Pages/Home";
import Game from "./Pages/Game";
import Menu from "./Pages/Menu";
import Test from "./App";


const routes =[
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/game/:id",
		element: <Game />,
	},
	{
		path: "/menu",
		element: <Menu />,
	},
	{
		path: "/test",
		element: <Test />,
	},
]

export default routes;