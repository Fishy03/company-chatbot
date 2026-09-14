import { useState } from "react";
import "./App.css";
import Admin from "./Admin";
import Login from "./Login";


function App() {

  const [currentUser, setCurrentUser] = useState(() => {

    const savedUser = localStorage.getItem(
      "company_chatbot_user"
    );

    if (!savedUser) {
      return null;
    }

    try {

      return JSON.parse(savedUser);

    } catch {

      localStorage.removeItem(
        "company_chatbot_user"
      );

      return null;
    }

  });


  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);


  function handleLogin(user) {

    setCurrentUser(user);

  }


  function handleLogout() {

    localStorage.removeItem(
      "company_chatbot_user"
    );

    localStorage.removeItem(
      "auth_token"
    );

    setCurrentUser(null);

    setMessages([]);

  }


  // --------------------------------------------------
  // LOGIN CHECK
  // --------------------------------------------------

  if (!currentUser) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );

  }


  // --------------------------------------------------
  // ADMIN PAGE
  // --------------------------------------------------

  if (
    window.location.pathname === "/admin"
  ) {

    if (currentUser.role !== "admin") {

      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#0f1117",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >

          <div>

            <h2>
              Access Denied
            </h2>

            <p
              style={{
                color: "#8d94a3",
              }}
            >
              Only administrators can access this page.
            </p>


            <button
              onClick={() => {

                window.history.pushState(
                  {},
                  "",
                  "/"
                );

                window.location.reload();

              }}
              style={{
                marginTop: "10px",
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Back to Chat
            </button>

          </div>

        </div>
      );

    }


    return (
      <Admin
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );

  }


  // --------------------------------------------------
  // SEND CHAT MESSAGE
  // --------------------------------------------------

  async function sendMessage() {

    const text = message.trim();


    if (!text || loading) {
      return;
    }


    const userMessage = {
      role: "user",
      content: text,
    };


    // Keep the conversation locally

    const updatedMessages = [
      ...messages,
      userMessage,
    ];


    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            ...(
              currentUser.token
                ? {
                    Authorization:
                      `Bearer ${currentUser.token}`,
                  }
                : {}
            ),
          },

          body: JSON.stringify({
            message: text,
            history: messages,
          }),
        }
      );


      if (!response.ok) {

        throw new Error(
          "Failed to get response"
        );

      }


      const data = await response.json();


      setMessages((previous) => [

        ...previous,

        {
          role: "assistant",
          content: data.response,
        },

      ]);


    } catch (error) {

      setMessages((previous) => [

        ...previous,

        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the company knowledge service.",
        },

      ]);

    } finally {

      setLoading(false);

    }

  }


  // --------------------------------------------------
  // ENTER KEY
  // --------------------------------------------------

  function handleKeyDown(event) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  }


  // --------------------------------------------------
  // CHAT UI
  // --------------------------------------------------

  return (

    <div className="app">


      <header className="header">

        <div className="brand">

          <div className="logo">
            C
          </div>


          <div>

            <h1>
              Company Knowledge
            </h1>

            <p>
              Internal AI Assistant
            </p>

          </div>

        </div>


        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
  <div className="status">
    <span className="status-dot"></span>
    Online
  </div>

  <button
    onClick={handleLogout}
    style={{
      padding: "8px 14px",
      border: "1px solid #343a47",
      borderRadius: "8px",
      background: "transparent",
      color: "#d8dce5",
      fontSize: "13px",
      cursor: "pointer",
    }}
  >
    Logout
  </button>
</div>

      </header>


      <main className="chat-container">


        {messages.length === 0 ? (

          <div className="welcome">


            <div className="welcome-icon">
              ✦
            </div>


            <h2>
              How can I help?
            </h2>


            <p>
              Ask questions about company policies,
              departments, projects, documentation,
              and existing company knowledge.
            </p>


            <div className="suggestions">


              <button
                onClick={() =>
                  setMessage(
                    "Who should I contact about leave?"
                  )
                }
              >
                Who handles employee leave?
              </button>


              <button
                onClick={() =>
                  setMessage(
                    "What departments does the company have?"
                  )
                }
              >
                What departments does the company have?
              </button>


              <button
                onClick={() =>
                  setMessage(
                    "Who should I contact about employee benefits?"
                  )
                }
              >
                Who handles employee benefits?
              </button>


            </div>

          </div>

        ) : (


          <div className="messages">


            {messages.map((item, index) => (


              <div
                className={`message-row ${item.role}`}
                key={index}
              >


                <div className="avatar">

                  {item.role === "user"
                    ? "Y"
                    : "C"}

                </div>


                <div className="message-content">


                  <div className="message-name">

                    {item.role === "user"
                      ? "You"
                      : "Company AI"}

                  </div>


                  <div className="message-bubble">

                    {item.content}

                  </div>


                </div>


              </div>

            ))}


            {loading && (

              <div className="message-row assistant">


                <div className="avatar">
                  C
                </div>


                <div className="message-content">


                  <div className="message-name">
                    Company AI
                  </div>


                  <div className="message-bubble typing">

                    <span></span>
                    <span></span>
                    <span></span>

                  </div>


                </div>


              </div>

            )}


          </div>

        )}


      </main>


      <div className="input-area">


        <div className="input-wrapper">


          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask something about the company..."
            rows="1"
          />


          <button
            className="send-button"
            onClick={sendMessage}
            disabled={
              !message.trim() ||
              loading
            }
          >
            ↑
          </button>


        </div>


        <p className="input-note">
          Company AI can make mistakes.
          Verify important information.
        </p>


      </div>


    </div>

  );

}


export default App;