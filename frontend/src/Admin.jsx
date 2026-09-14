import { useEffect, useState } from "react";
import "./Admin.css";


function Admin({
  currentUser,
  onLogout,
}) {

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [deletingDocument, setDeletingDocument] = useState(null);


  // --------------------------------------------------
  // AUTHORIZATION HEADER
  // --------------------------------------------------

  function getAuthHeaders() {

    return {
      Authorization: `Bearer ${currentUser.token}`,
    };

  }


  // --------------------------------------------------
  // LOAD DOCUMENTS
  // --------------------------------------------------

  async function loadDocuments() {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/documents",
        {
          headers: getAuthHeaders(),
        }
      );


      if (!response.ok) {

        if (response.status === 401) {

          throw new Error(
            "Your login session has expired."
          );

        }

        if (response.status === 403) {

          throw new Error(
            "You do not have permission to view documents."
          );

        }

        throw new Error(
          "Failed to load documents."
        );

      }


      const data = await response.json();

      setDocuments(data.documents);


    } catch (error) {

      setMessage(error.message);


    } finally {

      setLoadingDocuments(false);

    }

  }


  useEffect(() => {

    loadDocuments();

  }, []);


  // --------------------------------------------------
  // FILE SELECTION
  // --------------------------------------------------

  function handleFileChange(event) {

    const file = event.target.files[0];


    if (!file) {
      return;
    }


    setSelectedFile(file);
    setMessage("");

  }


  // --------------------------------------------------
  // UPLOAD DOCUMENT
  // --------------------------------------------------

  async function uploadDocument() {

    if (!selectedFile || uploading) {
      return;
    }


    setUploading(true);
    setMessage("");


    const formData = new FormData();

    formData.append(
      "file",
      selectedFile
    );


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/documents/upload",
        {
          method: "POST",

          headers: getAuthHeaders(),

          body: formData,
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Upload failed."
        );

      }


      setMessage(
        `${data.filename} uploaded successfully. ${data.chunks_ingested} chunk(s) indexed.`
      );


      setSelectedFile(null);


      document.getElementById(
        "document-input"
      ).value = "";


      await loadDocuments();


    } catch (error) {

      setMessage(error.message);


    } finally {

      setUploading(false);

    }

  }


  // --------------------------------------------------
  // DELETE DOCUMENT
  // --------------------------------------------------

  async function deleteDocument(filename) {

    if (deletingDocument) {
      return;
    }


    const confirmed = window.confirm(
      `Are you sure you want to delete "${filename}"?`
    );


    if (!confirmed) {
      return;
    }


    setDeletingDocument(filename);
    setMessage("");


    try {

      const response = await fetch(
        `http://127.0.0.1:8000/documents/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",

          headers: getAuthHeaders(),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Delete failed."
        );

      }


      setMessage(
        `${filename} deleted successfully.`
      );


      await loadDocuments();


    } catch (error) {

      setMessage(error.message);


    } finally {

      setDeletingDocument(null);

    }

  }


  // --------------------------------------------------
  // ADMIN UI
  // --------------------------------------------------

  return (

    <div className="admin-page">


      <header className="admin-header">

        <div>

          <h1>
            Company Knowledge
          </h1>

          <p>
            Admin Dashboard
          </p>

        </div>


        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >

          <div className="admin-status">
            ● Admin
          </div>


          <button
            onClick={onLogout}
            style={{
              background: "transparent",
              border: "1px solid #343946",
              color: "#c5cad5",
              padding: "7px 12px",
              borderRadius: "7px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Logout
          </button>

        </div>

      </header>


      <main className="admin-content">


        <section className="admin-intro">

          <h2>
            Knowledge Documents
          </h2>

          <p>
            Upload and manage documents used by
            the company AI assistant.
          </p>

        </section>


        <section className="upload-card">


          <div className="upload-icon">
            ↑
          </div>


          <h3>
            Upload a document
          </h3>


          <p>
            Add company policies, project documentation,
            HR documents, and other internal knowledge.
          </p>


          <input
            id="document-input"
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
            hidden
          />


          <label
            htmlFor="document-input"
            className="choose-button"
          >
            Choose Document
          </label>


          {selectedFile && (

            <div className="selected-file">

              Selected:{" "}

              <strong>
                {selectedFile.name}
              </strong>

            </div>

          )}


          {selectedFile && (

            <button
              className="upload-button"
              onClick={uploadDocument}
              disabled={uploading}
            >
              {uploading
                ? "Uploading..."
                : "Upload Document"}
            </button>

          )}


          {message && (

            <div className="upload-message">
              {message}
            </div>

          )}


          <span>
            Supported formats: PDF, TXT, DOCX
          </span>


        </section>


        <section className="documents-section">


          <h3>
            Uploaded Documents
          </h3>


          {loadingDocuments ? (

            <div className="document-loading">
              Loading documents...
            </div>

          ) : documents.length === 0 ? (

            <div className="document-empty">
              No documents have been uploaded yet.
            </div>

          ) : (

            <div className="document-list">


              {documents.map((document) => (

                <div
                  className="document-card"
                  key={document.filename}
                >


                  <div className="document-info">


                    <div className="document-icon">
                      📄
                    </div>


                    <div>

                      <strong>
                        {document.filename}
                      </strong>


                      <p>

                        {document.chunks}{" "}

                        {document.chunks === 1
                          ? "chunk"
                          : "chunks"}{" "}

                        indexed

                      </p>

                    </div>


                  </div>


                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteDocument(
                        document.filename
                      )
                    }
                    disabled={
                      deletingDocument ===
                      document.filename
                    }
                  >

                    {deletingDocument ===
                    document.filename
                      ? "Deleting..."
                      : "Delete"}

                  </button>


                </div>

              ))}


            </div>

          )}


        </section>


      </main>


    </div>

  );

}


export default Admin;