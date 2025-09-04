import Home from "./Pages/Home";
import Game from "./Pages/Game";
import Menu from "./Pages/Menu";
import Test from "./App";
import ProtectedRoute from "./components/ProtectedRoute";

const routes = [
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/game/:id",
		element: (
			<ProtectedRoute>
				<Game />
			</ProtectedRoute>
		),
	},
	{
		path: "/menu",
		element: (
			<ProtectedRoute>
				<Menu />
			</ProtectedRoute>
		),
	},
	{
		path: "/test",
		element: <Test />,
	},
];

export default routes;
