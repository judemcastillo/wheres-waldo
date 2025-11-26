import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { api, setToken, isAuthed } from "../lib/api";
import LeaderboardTabs from "../components/LeaderBoardTabs";

export default function Home() {
	const nav = useNavigate();

	const initialLogin = { email: "", password: "" };
	const initialRegister = { email: "", name: "", password: "" };

	// ✅ use the object, not { initialLogin }
	const [loginForm, setLoginForm] = useState(initialLogin);
	const [errMessage, setErrMessage] = useState("");
	const [showLogin, setShowLogin] = useState(false);
	const [showRegister, setShowRegister] = useState(false);
	const [registerForm, setRegisterForm] = useState(initialRegister);
	const emailRef = useRef(null);
	const registerEmailRef = useRef(null);
	const [authLoading, setAuthLoading] = useState(null); // "guest" | "login" | "register" | null

	const LoadingSpinner = ({ className = "" }) => (
		<span
			className={`inline-block h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin ${className}`}
			aria-hidden="true"
		/>
	);

	// Close + reset helper
	function closeLogin() {
		setShowLogin(false);
		setLoginForm(initialLogin);
		setErrMessage("");
	}
	function closeRegister() {
		setShowRegister(false);
		setRegisterForm(initialRegister);
		setErrMessage("");
	}

	async function handleGuestSubmit(e) {
		e.preventDefault();
		setAuthLoading("guest");
		try {
			const data = await api("/api/auth/guest", {
				method: "POST",
				body: JSON.stringify({ name: "Guest" }),
			});
			setToken(data.token);
			nav("/menu");
		} catch (err) {
			console.error(err);
		} finally {
			setAuthLoading(null);
		}
	}

	async function handleRegister(e) {
		e.preventDefault();
		setErrMessage("");
		setAuthLoading("register");
		try {
			const data = await api("/api/auth/register", {
				method: "POST",
				body: JSON.stringify({
					email: registerForm.email,
					name: registerForm.name,
					password: registerForm.password,
				}),
			});

			closeRegister();
		} catch (error) {
			setErrMessage("Invalid email or password.");
		} finally {
			setAuthLoading(null);
		}
	}

	async function handleLogin(e) {
		e.preventDefault();
		setErrMessage("");
		setAuthLoading("login");
		try {
			const data = await api("/api/auth/login", {
				method: "POST",
				body: JSON.stringify({
					email: loginForm.email,
					password: loginForm.password,
				}),
			});
			setToken(data.token);
			nav("/menu");
			closeLogin();
		} catch (error) {
			setErrMessage("Invalid email or password.");
		} finally {
			setAuthLoading(null);
		}
	}

	// Focus + Escape (REGISTER)  ✅ actually call closeRegister()
	useEffect(() => {
		if (!showRegister) return;
		registerEmailRef.current?.focus();
		const onKey = (e) => {
			if (e.key === "Escape") closeRegister();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [showRegister]);

	// Focus + Escape (LOGIN)  ✅ actually call closeLogin()
	useEffect(() => {
		if (!showLogin) return;
		emailRef.current?.focus();
		const onKey = (e) => {
			if (e.key === "Escape") closeLogin();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [showLogin]);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			if (!isAuthed()) return; // quick check: token exists?
			try {
				await api("/api/auth/me"); // validate token with server
				if (!cancelled) nav("/menu", { replace: true });
			} catch {
				// token invalid/expired → clear it and stay on Home
				setToken(null);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [nav]);

	return (
		<div className="bg-gray-200 min-h-screen max-w-screen flex items-start justify-center">
			<div
				className=" bg-white w-[95vw] max-w-[900px] p-6 rounded-lg mt-4 shadow-md flex flex-col 
        items-center gap-6 mb-3"
			>
				<img
					src="/waldo-logo.png"
					alt="Where's Waldo?"
					className="flex  md:w-lg w-3xs sm:w-sm p-2"
				/>
				<div className="flex flex-col gap-2 pt-5 w-2/3 font-sans font-bold">
					<button
				className="rounded bg-green-500 px-10 py-2 text-white cursor-pointer
                    hover:bg-green-400"
						onClick={handleGuestSubmit}
						disabled={!!authLoading}
					>
						{authLoading === "guest" ? (
							<span className="flex items-center justify-center gap-2">
								<LoadingSpinner /> Signing in...
							</span>
						) : (
							"Play as Guest"
						)}
					</button>
					<button
						onClick={() => setShowLogin(true)}
						className="rounded bg-blue-500 px-10 py-2 text-white cursor-pointer
                    hover:bg-blue-400"
					>
						Login
					</button>
					<button
						className="rounded bg-gray-500 px-10 py-2 text-white cursor-pointer
                    hover:bg-gray-400"
						onClick={() => setShowRegister(true)}
					>
						Register
					</button>
				</div>

				{showRegister && (
					<div
						className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center "
						onClick={(e) => {
							if (e.target === e.currentTarget) {
								closeRegister();
							}
						}}
						role="dialog"
						aria-modal="true"
					>
						<div
							className="bg-white rounded-md max-w-140 w-[min(90vw,480px)] text-black p-4 shadow"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-end">
								<button
									type="button"
									className="text-gray-500 hover:text-red-700"
									onClick={closeRegister} // ✅ use closer
									aria-label="Close"
								>
									X
								</button>
							</div>

							<h2 className="text-3xl font-bold p-2 text-center">Register</h2>

							{errMessage && (
								<p className="text-red-600 text-sm text-center">{errMessage}</p>
							)}

							<form
								onSubmit={handleRegister}
								className="w-full flex flex-col gap-3 px-2 pb-3 space-y-3"
							>
								<input
									ref={registerEmailRef}
									type="email"
									className="rounded-md p-2 bg-gray-200"
									placeholder="Email"
									value={registerForm.email}
									onChange={(e) =>
										setRegisterForm({ ...registerForm, email: e.target.value })
									}
									required
								/>
								<input
									type="text"
									className="rounded-md p-2 bg-gray-200"
									placeholder="Name"
									value={registerForm.name}
									onChange={(e) =>
										setRegisterForm({ ...registerForm, name: e.target.value })
									}
									required
								/>
								<input
									type="password"
									className="rounded-md p-2 bg-gray-200"
									placeholder="Password"
									value={registerForm.password}
									onChange={(e) =>
										setRegisterForm({
											...registerForm,
											password: e.target.value,
										})
									}
									required
								/>
								<button
									className="w-full bg-rose-600 p-2 rounded-md text-white disabled:opacity-60 disabled:cursor-not-allowed"
									disabled={authLoading === "register"}
								>
									{authLoading === "register" ? (
										<span className="flex items-center justify-center gap-2">
											<LoadingSpinner />
											Creating account...
										</span>
									) : (
										"Submit"
									)}
								</button>
							</form>

							<p className="text-gray-500 text-sm text-center flex flex-row justify-center gap-1">
								Do you have an account?{" "}
								<div
									className="text-blue-600 underline cursor-pointer"
									onClick={() => {
										closeRegister();
										setShowLogin(true);
									}}
								>
									Login here
								</div>
							</p>
						</div>
					</div>
				)}

				{showLogin && (
					<div
						className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
						onClick={(e) => {
							if (e.target === e.currentTarget) closeLogin();
						}} // ✅ no arg
						role="dialog"
						aria-modal="true"
					>
						<div
							className="bg-white rounded-md max-w-140 w-[min(90vw,480px)] text-black p-4 shadow"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-end">
								<button
									type="button"
									className="text-gray-500 hover:text-red-700"
									onClick={closeLogin} // ✅ use closer so it resets
									aria-label="Close"
								>
									X
								</button>
							</div>

							<h2 className="text-3xl font-bold p-2 text-center">Login</h2>

							{errMessage && (
								<p className="text-red-600 text-sm text-center">{errMessage}</p>
							)}

							<form
								onSubmit={handleLogin}
								className="w-full flex flex-col gap-3 px-2 pb-3 space-y-3"
							>
								<input
									ref={emailRef}
									type="email"
									className="rounded-md p-2 bg-gray-200"
									placeholder="Email"
									value={loginForm.email}
									onChange={(e) =>
										setLoginForm({ ...loginForm, email: e.target.value })
									}
									required
								/>
								<input
									type="password"
									className="rounded-md p-2 bg-gray-200"
									placeholder="Password"
									value={loginForm.password}
									onChange={(e) =>
										setLoginForm({ ...loginForm, password: e.target.value })
									}
									required
								/>
								<button
									className="w-full bg-rose-600 p-2 rounded-md text-white disabled:opacity-60 disabled:cursor-not-allowed"
									disabled={authLoading === "login"}
								>
									{authLoading === "login" ? (
										<span className="flex items-center justify-center gap-2">
											<LoadingSpinner />
											Signing in...
										</span>
									) : (
										"Login"
									)}
								</button>
							</form>

							<p className="text-gray-500 text-sm text-center flex flex-row justify-center gap-1">
								Don&apos;t have an account?{" "}
								<div
									className="text-blue-600 underline cursor-pointer"
									onClick={() => {
										closeLogin();
										setShowRegister(true);
									}}
								>
									Register Here
								</div>
							</p>
						</div>
					</div>
				)}

				<div className="font-sans  border-t-black border-t-2  pt-3 mt-3 flex flex-col justify-center items-center w-[90%] max-w-[600px]">
					<span className="text-center text-xl font-bold">Leader Board</span>
					<LeaderboardTabs/>
				</div>
			</div>
		</div>
	);
}
