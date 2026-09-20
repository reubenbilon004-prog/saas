import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";

import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;


// =====================================================
// LOGIN
// =====================================================

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    try {

      const response = await fetch(
        `${API}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          credentials: "include",

          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (response.ok) {

        localStorage.setItem(
          "accessToken",
          data.accessToken
        );

        navigate("/dashboard");

      } else {

        alert(data.message);
      }

    } catch (error) {

      console.log(error);

      alert("Server error");
    }
  };


  const googleLogin = () => {

    window.location.href =
      `${API}/api/auth/google`;
  };


  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center">
          SaaS
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Sign in to your account
        </p>


        <div className="mt-8 space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full px-4 py-3 border rounded-lg"
          />


          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full px-4 py-3 border rounded-lg"
          />


          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Login
          </button>


          <div className="flex items-center gap-3">

            <div className="flex-1 h-px bg-gray-200"></div>

            <span className="text-sm text-gray-400">
              OR
            </span>

            <div className="flex-1 h-px bg-gray-200"></div>

          </div>


          <button
            onClick={googleLogin}
            className="w-full border border-gray-300 text-black bg-white py-3 rounded-lg font-semibold hover:bg-gray-50"
          >
            Continue with Google
          </button>

        </div>


        <p className="text-center text-sm text-gray-500 mt-6">

          Don't have an account?{" "}

          <a
            href="/register"
            className="text-blue-600 font-semibold"
          >
            Register
          </a>

        </p>

      </div>

    </div>
  );
}


// =====================================================
// REGISTER
// =====================================================

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const register = async () => {

    try {

      const response = await fetch(
        `${API}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await response.json();


      if (response.ok) {

        alert(
          "Registration successful. Check your email to verify your account."
        );

        navigate("/");

      } else {

        alert(data.message);
      }

    } catch (error) {

      console.log(error);

      alert("Server error");
    }
  };


  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Join SaaS today
        </p>


        <div className="mt-8 space-y-4">

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full px-4 py-3 border rounded-lg"
          />


          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full px-4 py-3 border rounded-lg"
          />


          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full px-4 py-3 border rounded-lg"
          />


          <button
            onClick={register}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Create Account
          </button>

        </div>


        <p className="text-center text-sm text-gray-500 mt-6">

          Already have an account?{" "}

          <a
            href="/"
            className="text-blue-600 font-semibold"
          >
            Login
          </a>

        </p>

      </div>

    </div>
  );
}


// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {

  const navigate = useNavigate();
  useEffect(() => {

    const params = new URLSearchParams(
        window.location.search
    );

    const token = params.get("token");

    if (token) {

        localStorage.setItem(
            "accessToken",
            token
        );

        window.history.replaceState(
            {},
            document.title,
            "/dashboard"
        );
    }

}, []);

  const [result, setResult] = useState(null);


  // ---------------------------------------------------
  // Helper function for protected API requests
  // ---------------------------------------------------

  const apiRequest = async (
    url,
    options = {}
  ) => {

    let token =
      localStorage.getItem("accessToken");


    let response = await fetch(
      `${API}${url}`,
      {
        ...options,

        credentials: "include",

        headers: {
          "Content-Type": "application/json",

          ...options.headers,

          Authorization:
            `Bearer ${token}`
        }
      }
    );


    // Access token expired
    if (response.status === 401) {

      const refreshResponse =
        await fetch(
          `${API}/api/auth/refresh`,
          {
            method: "POST",
            credentials: "include"
          }
        );


      if (refreshResponse.ok) {

        const refreshData =
          await refreshResponse.json();


        localStorage.setItem(
          "accessToken",
          refreshData.accessToken
        );


        token =
          refreshData.accessToken;


        // Retry original request
        response = await fetch(
          `${API}${url}`,
          {
            ...options,

            credentials: "include",

            headers: {
              "Content-Type": "application/json",

              ...options.headers,

              Authorization:
                `Bearer ${token}`
            }
          }
        );

      } else {

        localStorage.removeItem(
          "accessToken"
        );

        navigate("/");

        return null;
      }
    }


    return response;
  };


  // ---------------------------------------------------
  // PROFILE
  // ---------------------------------------------------

  const getProfile = async () => {

    try {

      const response =
        await apiRequest(
          "/api/user/profile"
        );


      if (!response) return;


      const data =
        await response.json();


      setResult(data);

    } catch (error) {

      console.log(error);

      alert("Failed to load profile");
    }
  };


  // ---------------------------------------------------
  // SUBSCRIPTION
  // ---------------------------------------------------

  const getSubscription = async () => {

    try {

      const response =
        await apiRequest(
          "/api/subscription/me"
        );


      if (!response) return;


      const data =
        await response.json();


      setResult(data);

    } catch (error) {

      console.log(error);

      alert("Failed to load subscription");
    }
  };


  // ---------------------------------------------------
  // UPGRADE
  // ---------------------------------------------------

  const upgrade = async () => {

    try {

      const response =
        await apiRequest(
          "/api/subscription/upgrade-plan",
          {
            method: "POST"
          }
        );


      if (!response) return;


      const data =
        await response.json();


      setResult(data);

    } catch (error) {

      console.log(error);

      alert("Upgrade failed");
    }
  };


  // ---------------------------------------------------
  // PRO FEATURE
  // ---------------------------------------------------

  const testPro = async () => {

    try {

      const response =
        await apiRequest(
          "/api/subscription/pro-test"
        );


      if (!response) return;


      const data =
        await response.json();


      setResult(data);

    } catch (error) {

      console.log(error);

      alert("Pro feature request failed");
    }
  };


  // ---------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------

  const logout = async () => {

    try {

      await fetch(
        `${API}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include"
        }
      );

    } catch (error) {

      console.log(error);

    } finally {

      localStorage.removeItem(
        "accessToken"
      );

      navigate("/");
    }
  };


  return (

    <div className="min-h-screen bg-gray-100">


      {/* NAVBAR */}

      <nav className="bg-white border-b px-8 py-4 flex justify-between">

        <h1 className="text-xl font-bold">
          SaaS
        </h1>


        <button
          onClick={logout}
          className="text-red-600 font-semibold"
        >
          Logout
        </button>

      </nav>


      {/* MAIN */}

      <main className="max-w-6xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold">
          Dashboard
        </h2>

        <p className="text-gray-500 mt-2">
          Manage your account and subscription.
        </p>


        {/* CARDS */}

        <div className="grid md:grid-cols-3 gap-6 mt-8">


          {/* PROFILE */}

          <div className="bg-white rounded-xl p-6 shadow">

            <h3 className="text-lg font-bold">
              Profile
            </h3>

            <p className="text-gray-500 mt-2">
              View your account information.
            </p>


            <button
              onClick={getProfile}
              className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg"
            >
              View Profile
            </button>

          </div>


          {/* SUBSCRIPTION */}

          <div className="bg-white rounded-xl p-6 shadow">

            <h3 className="text-lg font-bold">
              Subscription
            </h3>

            <p className="text-gray-500 mt-2">
              Manage your subscription.
            </p>


            <button
              onClick={getSubscription}
              className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg"
            >
              View Subscription
            </button>


            <button
              onClick={upgrade}
              className="mt-4 ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Upgrade to Pro
            </button>

          </div>


          {/* PRO */}

          <div className="bg-white rounded-xl p-6 shadow">

            <h3 className="text-lg font-bold">
              Pro Features
            </h3>

            <p className="text-gray-500 mt-2">
              Access premium features.
            </p>


            <button
              onClick={testPro}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              Test Pro Feature
            </button>

          </div>

        </div>


        {/* API RESULT */}

        {result && (

          <div className="mt-8 bg-gray-900 text-green-400 rounded-xl p-6">

            <h3 className="text-white font-bold mb-3">
              API Response
            </h3>

            <pre className="whitespace-pre-wrap">
              {JSON.stringify(
                result,
                null,
                2
              )}
            </pre>

          </div>

        )}

      </main>

    </div>
  );
}


// =====================================================
// APP / ROUTES
// =====================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;