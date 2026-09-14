import { useState } from "react";


function Login({ onLogin }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleLogin(event) {

    event.preventDefault();


    if (loading) {
      return;
    }


    if (!username.trim() || !password) {

      setError(
        "Please enter your username and password."
      );

      return;

    }


    setLoading(true);
    setError("");


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Invalid username or password."
        );

      }


      // --------------------------------------------------
      // SAVE AUTHENTICATION TOKEN
      // --------------------------------------------------

      localStorage.setItem(
        "auth_token",
        data.token
      );


      // --------------------------------------------------
      // SAVE LOGGED-IN USER
      // --------------------------------------------------

      const user = {
        username: data.username,
        role: data.role,
        token: data.token,
      };


      localStorage.setItem(
        "company_chatbot_user",
        JSON.stringify(user)
      );


      // Send complete user information to App

      onLogin(user);


    } catch (error) {

      setError(error.message);

    } finally {

      setLoading(false);

    }

  }


  return (

    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1117",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#181b23",
          border: "1px solid #292e39",
          borderRadius: "16px",
          padding: "40px",
          boxSizing: "border-box",
          boxShadow:
            "0 20px 50px rgba(0, 0, 0, 0.3)",
        }}
      >

        {/* Logo */}

        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "#ffffff",
            color: "#111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "24px",
          }}
        >
          C
        </div>


        {/* Heading */}

        <h1
          style={{
            color: "#ffffff",
            margin: "0 0 8px",
            fontSize: "28px",
            fontWeight: "600",
          }}
        >
          Company Knowledge
        </h1>


        <p
          style={{
            color: "#8d94a3",
            margin: "0 0 32px",
            fontSize: "14px",
          }}
        >
          Sign in to the Internal AI Assistant
        </p>


        <form onSubmit={handleLogin}>


          {/* Username */}

          <label
            style={{
              display: "block",
              color: "#d8dce5",
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            Username
          </label>


          <input
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            placeholder="Enter your username"
            autoComplete="username"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 14px",
              marginBottom: "18px",
              borderRadius: "9px",
              border: "1px solid #343a47",
              background: "#11141b",
              color: "#ffffff",
              outline: "none",
              fontSize: "14px",
            }}
          />


          {/* Password */}

          <label
            style={{
              display: "block",
              color: "#d8dce5",
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            Password
          </label>


          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 14px",
              marginBottom: "18px",
              borderRadius: "9px",
              border: "1px solid #343a47",
              background: "#11141b",
              color: "#ffffff",
              outline: "none",
              fontSize: "14px",
            }}
          />


          {/* Error */}

          {error && (

            <div
              style={{
                background: "#3a1f24",
                border: "1px solid #66313a",
                color: "#ff9da8",
                borderRadius: "8px",
                padding: "11px 13px",
                marginBottom: "18px",
                fontSize: "13px",
              }}
            >
              {error}
            </div>

          )}


          {/* Sign in button */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "9px",
              background: "#ffffff",
              color: "#111111",
              fontSize: "14px",
              fontWeight: "600",
              cursor:
                loading
                  ? "default"
                  : "pointer",
              opacity:
                loading
                  ? 0.6
                  : 1,
            }}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>


        </form>


        <p
          style={{
            color: "#626978",
            fontSize: "12px",
            textAlign: "center",
            margin: "24px 0 0",
          }}
        >
          Authorized company employees only
        </p>


      </div>

    </div>

  );

}


export default Login;