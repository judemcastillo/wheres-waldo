import { logout, getUser } from "../lib/api";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate, NavLink } from "react-router-dom";

export default function Header() {
	const active = ({ isActive }) =>
		isActive ? `${link} font-semibold underline` : link;
	const link = "text-sm px-2 py-1 rounded ";
	const user = getUser();
	const nav = useNavigate();

	function handleLogout() {
		logout();
		nav("/");
	}
	return (
		<>
			<div className="min-w-screen bg-rose-700 flex flex-row items-center justify-center text-white text-md">
				<div className="flex  flex-row justify-between items-center py-4 max-w-[1200px] w-[95vw] self-center px-2">
					<img src="/Banner.png" alt="Hey there" className="w-25" />
					<div className="flex flex-row gap-2 items-center">
						<NavLink to="/menu" className={active}>
							<p className="text-white text-lg hover:text-gray-100">Home</p>
						</NavLink>
						<div>Logged in as: {user.name||""}</div>
						<button className="border-l-2 pl-2.5 flex flex-row gap-1 cursor-pointer hover:text-gray-100 items-center">
							<span onClick={handleLogout}>Logout </span>
							<IoLogOutOutline className="size-5" />
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
